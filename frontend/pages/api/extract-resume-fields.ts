import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  form.parse(req, async (err: any, fields: any, files: any) => {
    try {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(400).json({ error: 'Failed to parse form data' });
      }

      if (!files.resume || !Array.isArray(files.resume)) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = files.resume[0]; // Get the first file
      
      if (!file || !file.filepath) {
        return res.status(400).json({ error: 'Invalid file data' });
      }

      console.log('File received:', {
        originalFilename: file.originalFilename,
        filepath: file.filepath,
        size: file.size
      });

      // Clean up the uploaded file
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup file:', cleanupError);
      }

      // Simple success response
      console.log('Resume uploaded successfully:', file.originalFilename);

      res.status(200).json({ 
        success: true, 
        message: 'Resume uploaded successfully',
        filename: file.originalFilename
      });

    } catch (error: any) {
      console.error('Resume parsing error:', error);
      res.status(500).json({ 
        error: 'Failed to parse resume', 
        details: error.message || 'Unknown error occurred' 
      });
    }
  });
} 