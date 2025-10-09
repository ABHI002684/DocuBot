import {Buffer} from 'buffer'; 

const FileUpload = ({setFile}) => {
    const handleFileUpload = async(e)=>{
        const fileUpload = await e.target.files[0].arrayBuffer(); 
        const file={
            type: e.target.files[0].type,
            file:Buffer.from(fileUpload).toString('base64'),
            imageUrl : e.target.files[0].type.includes("pdf")?"/document-icon.png": 
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
    </div>
  )
}

export default FileUpload
