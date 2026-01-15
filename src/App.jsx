import { useState } from 'react'

export default function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)

  const uploadFile = async () => {
    setError(null)

    if (!file) {
      setStatus('No file selected')
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

      if (!res.ok) {
        throw data
      }

      setStatus(`Uploaded successfully (ID: ${data.fileId})`)
    } catch (err) {
      console.error(err)

      setStatus('Upload failed')
      setError(
        `Stage: ${err.stage || 'unknown'} | Message: ${err.message || 'No details'}`
      )
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Upload to Google Drive</h2>

      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <br /><br />

      <button onClick={uploadFile}>Upload</button>

      <p>{status}</p>

      {error && (
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {error}
        </pre>
      )}
    </div>
  )
}
