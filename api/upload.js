import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { fileName } = req.body
    const file = req.body.file  // should be Base64 encoded string

    if (!fileName || !file) {
      return res.status(400).json({ error: 'Missing file or filename' })
    }

    // Convert Base64 to Buffer
    const buffer = Buffer.from(file, 'base64')

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`uploads/${fileName}`, buffer, { upsert: true })

    if (error) throw error

    const { publicUrl } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path)

    res.status(200).json({ url: publicUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
