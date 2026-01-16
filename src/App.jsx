import { useState } from "react"
import { storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function App() {
  const [file, setFile] = useState(null)
  const [stage, setStage] = useState("idle")
  const [message, setMessage] = useState("")

  const MAX_SIZE_MB = 50

  const fail = (where, err) => {
    console.error(where, err)

    let msg = "Unknown error"

    if (!err) {
      msg = "Unexpected failure"
    } else if (err.code) {
      switch (err.code) {
        case "storage/unauthorized":
          msg = "Permission denied. Check Firebase Storage rules."
          break
        case "storage/canceled":
          msg = "Upload canceled."
          break
        case "storage/unknown":
          msg = "Unknown storage error. Check network & bucket."
          break
        case "storage/quota-exceeded":
          msg = "Storage quota exceeded."
          break
        default:
          msg = `${err.code}: ${err.message}`
      }
    } else if (err.message) {
      msg = err.message
    }

    setStage(where)
    setMessage(msg)
  }

  const uploadFile = async () => {
    if (!storage) {
      fail("init", { message: "Firebase not initialized" })
      return
    }

    if (!file) {
      fail("validation", { message: "No file selected" })
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      fail("validation", {
        message: `File too large (max ${MAX_SIZE_MB}MB)`
      })
      return
    }

    try {
      setStage("uploading")
      setMessage("Uploading file...")

      const fileRef = ref(
        storage,
        `uploads/${Date.now()}-${file.name}`
      )

      const snapshot = await uploadBytes(fileRef, file)

      setStage("finalizing")
      setMessage("Getting download URL...")

      const url = await getDownloadURL(snapshot.ref)

      setStage("success")
      setMessage(`Upload successful!\n${url}`)
    } catch (err) {
      fail("upload", err)
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Firebase Storage Upload Test</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={uploadFile}>
        Upload
      </button>

      <hr />

      <strong>Stage:</strong> {stage}
      <br />
      <strong>Message:</strong>
      <pre>{message}</pre>
    </div>
  )
}
