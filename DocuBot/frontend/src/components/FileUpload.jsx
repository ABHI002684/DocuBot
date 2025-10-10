import { Buffer } from 'buffer';
import axios from 'axios';
import { useState } from 'react';
import { LifeLine } from 'react-loading-indicators'
const FileUpload = ({ setFile }) => {

  const [status, setStatus] = useState("idle");
  const handleFileUpload = async (e) => {
    const fileUpload = await e.target.files[0].arrayBuffer();
    if (e.target.files[0].type.includes("pdf")) {
      setStatus("loading");

      const uploadedFile = await e.target.files[0]
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await axios.post(
        "http://localhost:5000/api/embed-pdf", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data.message);
      setStatus("success");
    }
    const file = {
      type: e.target.files[0].type,
      file: Buffer.from(fileUpload).toString('base64'),
      imageUrl: e.target.files[0].type.includes("pdf") ? "/document-icon.png" :
        URL.createObjectURL(e.target.files[0])
    }
    setFile(file);
  }

  return (
    <div>
      <h2>Get Started</h2>
      <input
        type="file"

        accept='.pdf, .jpeg, .png, .jpg'
        onChange={handleFileUpload}
      />
      <hr />
            {
                status === "loading" ? 
                <LifeLine color="#694568ff" size="medium" text="file is uploading ....." textColor="#cd32caff" /> : null
            }
            
    </div>
  )
}

export default FileUpload
