import * as dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

const transformQuery= async(query, history)=> {
  history.push({
    role: "user",
    parts: [{ text: query }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: History,
    config: {
      systemInstruction: `You are a query rewriting expert. Based on the provided 
      chat history, rephrase the "Follow Up user Question" into a complete, 
      standalone question that can be understood without the chat history. 
      Only output the rewritten question and nothing else.
      `,
    },
  });

  history.pop();

  return response.text;
}
const queryResult = async (req, res) => {
  try {
    const { query, history } = req.body;
    const queries = await transformQuery(query,history);

    //convert the user query into embedding (vector)
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "text-embedding-004",
    });

    const queryVector = await embeddings.embedQuery(queries);

    //Search Relevant document into vector DB

    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true,
    });

    //create the context for the LLM model
    const context = searchResults.matches
      .map((match) => match.metadata.text)
      .join("\n\n---\n\n");

    // Query + Context to LLM
    const ai = new GoogleGenAI({});

    history.push({
      role: "user",
      parts: [{ text: queries }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: history,
      config: {
        systemInstruction: `You are DocuBot, an intelligent assistant designed to help users understand and interact with the contents of uploaded PDF documents.

You will be given:

The content extracted from one or more PDFs (context).

A user query related to that content.

Your task is to answer the user's question based ONLY on the information present in the provided PDF content.

If the answer is not explicitly found or inferred from the document, respond with:

"I could not find the answer in the provided document."

Guidelines:

Keep your answers concise, factual, and easy to understand.

Do not make assumptions or add information not supported by the document.

If relevant, quote short portions of the document to support your answer.

Maintain a professional and educational tone.
      
      Context: ${context}
      `,
      },
    });

    history.push({
      role: "model",
      parts: [{ text: response.text }],
    });
  } catch (err) {
    return res.json({ message: err.message });
  }
};
