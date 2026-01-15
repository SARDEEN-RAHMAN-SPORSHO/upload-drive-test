import { google } from 'googleapis'
import multer from 'multer'
import stream from 'stream'

export const config = {
  api: {
    bodyParser: false
  }
}

const upload = multer()

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) reject(result)
      else resolve(result)
    })
  })
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        stage: 'request',
        message: 'Method not allowed'
      })
    }

    await runMiddleware(req, res, upload.single('file'))

    if (!req.file) {
      return res.status(400).json({
        stage: 'multer',
        message: 'No file received'
      })
    }

    // 🔑 Authenticate service account
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive']
    })

    await auth.authorize().catch(err => {
      throw { stage: 'auth', message: err.message }
    })

    const drive = google.drive({ version: 'v3', auth })

    const bufferStream = new stream.PassThrough()
    bufferStream.end(req.file.buffer)

    // 🔄 Upload file to shared folder
    const response = await drive.files.create({
      supportsAllDrives: true, // Required for shared folders
      requestBody: {
        name: req.file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream
      }
    })

    res.json({
      success: true,
      fileId: response.data.id,
      message: 'File uploaded successfully'
    })
  } catch (err) {
    console.error('UPLOAD ERROR:', err)

    res.status(500).json({
      success: false,
      stage: err.stage || 'unknown',
      message: err.message || 'Unknown error',
      fullError: err
    })
  }
}
