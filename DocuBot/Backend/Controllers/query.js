import * as dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// function to transform the follow up question into a standalone question
const transformQuery = async (query, history = []) => {
  const contents = history
    .filter(msg => msg.text)
    .map(msg => ({
      role: msg.role,
      parts: [{ type: "text", text: msg.text }],
    }));

  contents.push({
    role: "user",
    parts: [{ type: "text", text: query }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    systemInstruction: `
      You are a query rewriting expert. 
      Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history. 
      Only output the rewritten question.
    `,
    contents,
  });

  return response.text;
};

const queryResult = async (req, res) => {
  try {
    const { query, history = [] } = req.body;

    
    const rewrittenQuery = await transformQuery(query, history);

// Intializing the Embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "text-embedding-004",
    });
    const queryVector = await embeddings.embedQuery(rewrittenQuery);

    // Search relevant documents in Pinecone
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const searchResults = await pineconeIndex.query({
      topK: 10,
      vector: queryVector,
      includeMetadata: true,
    });

    const context = searchResults.matches
      .map(m => m.metadata.text)
      .join("\n\n---\n\n");

    //  Build contents for final DocuBot response
    const contents = history
      .filter(msg => msg.text)
      .map(msg => ({
        role: msg.role,
        parts: [{ type: "text", text: msg.text }],
      }));

    contents.push({
      role: "user",
      parts: [{ type: "text", text: rewrittenQuery }],
    });

    // Generate response using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      systemInstruction: `
        You are DocuBot, an intelligent assistant designed to help users understand and interact with the contents of uploaded PDF documents.

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
Do not use any prior knowledge or make assumptions. Use only the text from the context provided.
      `,
      contents,
    });

    const answerText = response.text;

    // 6️⃣ Update history
    history.push({ role: "model", text: answerText });

    res.json({ result: answerText, history });
  } catch (err) {
    res.json({ error: err.message });
  }
};

export default queryResult;
