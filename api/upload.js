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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  await runMiddleware(req, res, upload.single('file'))

  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive']
    )

    const drive = google.drive({ version: 'v3', auth })

    const bufferStream = new stream.PassThrough()
    bufferStream.end(req.file.buffer)

    await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: req.file.mimetype,
        body: bufferStream
      }
    })

    res.json({ message: 'File uploaded successfully' })
  } catch (err) {
    res.status(500).json({
      message: 'Upload failed',
      error: err.message
    })
  }
}
