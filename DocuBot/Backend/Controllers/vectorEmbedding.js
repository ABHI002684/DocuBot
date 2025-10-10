import * as dotenv from "dotenv";
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";


export const embedPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const message = await embedding(req.file.buffer);
    return res.json({ message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const embedding = async (fileBuffer) => {
  try {
    //loading the file
    const data = await pdf(fileBuffer);
    const pdfText = data.text;


    //splitting the file into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 300,
    });
    const chunkedDocs = await textSplitter.createDocuments([pdfText]);

    // Initializing the Embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "text-embedding-004",
    });

    //Initialize Pinecone Client (vector DB)
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    //Embed Chunks and Upload to Pinecone
    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    return "File embedded successfully";
  } catch (err) {
     return err.message;
  }
};

export default embedPDF;
