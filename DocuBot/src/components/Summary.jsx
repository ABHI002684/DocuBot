import React, { useEffect, useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import Loader from './Loader';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const Summary = ({ file }) => {
    
    const [summary, setSummary] = useState("");
    const [status, setStatus] = useState("idle");
    const getSummary = async () => {
        setStatus("loading");

        try {
            const contents = [
                { text: `Summarize this document in one short paragraph
                    (less than 100 words). use just plaintext with no markdown
                    or HTML tags` },
                {
                    inlineData: {
                        mimeType: file.type,
                        data: file.file
                    }
                }
            ];

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents
            });
            setStatus("success");
            setSummary(response.text);
        } catch (err) {
            setStatus("error");
        }
    }

    useEffect(() => {
        if (status === "idle") {
            getSummary();
        }
    }, [status]);


    return (
        <div>
            <img src={file.imageUrl} alt="preview image" />
            <h2>The Summary goes here</h2>
            {
                status === "loading" ? 
                <Loader /> : status === "success" ?
                <p>{summary}</p> :
                <p>error in getting summary</p>
            }
            
            
        </div>
    )
}

export default Summary
