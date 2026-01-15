import { useState, useEffect } from 'react'
import { uploadToDrive, listFiles } from './upload'
import './App.css'

interface FileItem {
  id: string
  name: string
  webViewLink: string
  createdTime: string
  size?: string
}

function App() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [files, setFiles] = useState<FileItem[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    const fileList = await listFiles()
    setFiles(fileList)
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    setMessage('')

    // Simulate progress for testing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const result = await uploadToDrive(file)
      
      clearInterval(interval)
      setProgress(100)
      
      if (result.success) {
        setMessage(`✅ Upload successful: ${result.fileName}`)
        await loadFiles() // Refresh file list
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error: any) {
      clearInterval(interval)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatSize = (bytes?: string) => {
    if (!bytes) return '-'
    const size = parseInt(bytes)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="app">
      <h1>Google Drive Upload Test</h1>
      
      <div className="upload-section">
        <h2>Upload File</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="file-input"
        />
        
        {uploading && (
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="files-section">
        <h2>Uploaded Files ({files.length})</h2>
        <button onClick={loadFiles} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        
        {loading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files uploaded yet</p>
        ) : (
          <div className="files-grid">
            {files.map(file => (
              <div key={file.id} className="file-card">
                <div className="file-name">{file.name}</div>
                <div className="file-details">
                  <span>📅 {formatDate(file.createdTime)}</span>
                  <span>📦 {formatSize(file.size)}</span>
                </div>
                <a 
                  href={file.webViewLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-link"
                >
                  View in Drive ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="note">
        <strong>Note:</strong> This is a TEST app. Service account credentials are exposed in frontend.<br />
        For production, always use a backend server.
      </div>
    </div>
  )
}

export default App
