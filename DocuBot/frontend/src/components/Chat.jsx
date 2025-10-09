import React, { useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import './Chat.css'
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const Chat = ({file}) => {
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    
    const handleSendMessage = async () => {
      if(input.length){
        let chatMessages = [...messages, {role:'user', text:input}, {role:'loader', text:''}];
        setInput("");
        setMessages(chatMessages);


         try {
            const contents = [
                { text: `
                  Answer this question from the context of the document:${input}
                  Answer as a chatbot with a short message and text only (no markdown or  tag or symbol)
                  chat history: ${JSON.stringify(messages)}
                  ` },
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
            
            chatMessages= [...chatMessages.filter((msg)=>msg.role!='loader'), {role:'model', text:response.text}];
            setMessages(chatMessages);
        } catch (err) {
          chatMessages= [...chatMessages.filter((msg)=>msg.role!='loader'), {role:'error', text:"error in sending message, please try again later"}];
          setMessages(chatMessages);
          console.log("error",err.message);
        }
      }
 
    }

  return (
    <section className='chat-window'>
      <h2>Chat</h2>
      {
        messages.length ? <div className="chat">
            {

        
            messages.map((msg)=>(
                <div  className={msg.role} key={msg.text} >
                    <p>{msg.text}</p>
                </div>
            ))
        }
        </div>:''
        }
      <div className="input-area">
        <input type="text"
              value={input}
              onChange={(e)=>setInput(e.target.value)}
               placeholder='ask any question about the document'
        />
         <button onClick={handleSendMessage} >send</button>
      </div>
    </section>
  )
}

export default Chat;