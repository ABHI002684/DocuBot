import embedPDF from "./Controllers/vectorEmbedding.js";
import queryResult from "./Controllers/query.js";
import multer from "multer";
import express from "express";
const router = express.Router();
const storage = multer.memoryStorage(); // store file in memory
const upload = multer({ storage });
// Route for embedding documents
router.post("/embed-pdf", upload.single("file"), embedPDF);

// Route for query
router.post('/query', queryResult);

export default router;