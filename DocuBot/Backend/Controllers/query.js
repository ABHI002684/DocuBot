import * as dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// function to transform the follow up question into a standalone question
const transformQuery = async (query, history = []) => {
  const contents = history
    .filter((msg) => msg.text)
    .map((msg) => ({
      role: msg.role,
      parts: [{ type: "text", text: msg.text }],
    }));

  contents.push({
    role: "user",
    parts: [{ type: "text", text: query }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
      .map((m) => m.metadata.text)
      .join("\n\n---\n\n");

    if (!context || context.trim() === "") {
      const fallbackAnswer =
        "I could not find the answer in the provided document.";
      history.push({ role: "model", text: fallbackAnswer });
      return res.json({ result: fallbackAnswer, history });
    }
    
    
    
    // Generate response using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      systemInstruction: `
You are DocuBot, an AI assistant. Answer the user query using ONLY the following PDF context:${context}.

If the answer is not in the document, respond with: "I could not find the answer in the provided document."

Give only to the point answers (max 10 words), like a short chatbot response.
only the give the answer that has been asked, do not add any extra information.
Do not assume or add any external knowledge.
  `,
      contents: [
        {
          role: "user",
          parts: [{ type: "text", text: rewrittenQuery }],
        },
      ],
    });
    const answerText = response.text;
    console.log("Answer:", answerText);
    // Update history
    history.push({ role: "model", text: answerText });

    res.json({ result: answerText, history });
  } catch (err) {
    res.json({ error: err.message });
  }
};

export default queryResult;
