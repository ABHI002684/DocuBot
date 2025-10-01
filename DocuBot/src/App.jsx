import React, { useState } from 'react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import Summary from './components/Summary'

const App = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  return (
    <div>
      <Header />
      {
        uploadedFile ? <Summary file={uploadedFile} /> : 
        <FileUpload setFile={setUploadedFile} />
      }
     
    </div>
  )
}

export default App
