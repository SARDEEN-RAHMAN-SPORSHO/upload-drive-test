import { useState } from 'react'

export default function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [url, setUrl] = useState('')

  async function upload() {
    if (!file) return alert('Select a file')
    setStatus('Reading file...')

    // Read file as Base64
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1] // remove prefix
      setStatus('Uploading...')

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            file: base64String,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setUrl(data.url)
        setStatus('Upload complete ✅')
      } catch (err) {
        console.error(err)
        setStatus('Error: ' + err.message)
      }
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Supabase Upload Test</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={upload}>Upload</button>
      <p>{status}</p>

      {url && (
        <>
          <a href={url} target="_blank">View File</a>
          <br />
          {file.type.startsWith('image') && <img src={url} width="200" />}
          {file.type.startsWith('video') && <video src={url} controls width="400" />}
        </>
      )}
    </div>
  )
}
