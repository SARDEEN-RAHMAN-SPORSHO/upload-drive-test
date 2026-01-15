import { useState } from 'react'

export default function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  const uploadFile = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setStatus('Uploading...')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      setStatus(data.message || 'Upload complete')
    } catch (err) {
      setStatus('Upload failed')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Upload to Google Drive</h2>

      <input
        type="file"
        onChange={e => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={uploadFile}>Upload</button>

      <p>{status}</p>
    </div>
  )
}
