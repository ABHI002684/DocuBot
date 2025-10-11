# **DocuBot**

**DocuBot** is an AI-powered document assistant that helps users interact with documents, extract information, and get answers using cutting-edge technologies like LangChain, Pinecone, and Google Gemini API.

---

## **🚀 Features**

- Upload PDFs and documents for AI processing
- Ask questions and get answers based on document content
- Provides AI-powered insights from a single document using Retrieval-Augmented Generation (RAG).
- Real-time interaction with documents through a chatbot interface
- Backend powered by Node.js and Express.js
- Persistent vector storage with Pinecone
- AI-powered embeddings using Google Generative AI

---

## **🛠 Tech Stack**

**Frontend:** React.js  
**Backend:** Node.js, Express.js  
**Vector Store:** Pinecone  
**AI & NLP:** LangChain, Google Gemini API

---

## **⚡ Installation**

**Clone the repository**

git clone https://github.com/ABHI002684/docuBot.git  
cd docuBot

## ** Install Dependencies**

### **Backend**

cd backend  
npm install

### **Frontend**
cd frontend  
npm install

### Setup Environment Variables

### Backend
Create a .env file in the backend folder:
PORT="your_port"
PINECONE_API_KEY=your_pinecone_api_key
GOOGLE_API_KEY=your_google_gemini_api_key
PINECONE_ENVIRONMENT="your_pinecone_environment"
PINECONE_INDEX_NAME= "your_pinecone_index"

### Frontend
Create a .env file in the backend folder:
GOOGLE_API_KEY=your_google_gemini_api_key

### Run the Application

### Backend
npm run dev

### Frontend
npm run dev

Then open 👉 http://localhost:5173


