import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

// Increase limit to match the 4MB limit for OCR.space
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Setting up multer for potential multipart form parsing if needed later
const upload = multer();

app.post('/api/ocr', upload.none(), async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      console.error('OCR processing error: OCR_SPACE_API_KEY not configured');
      return res.status(500).json({ error: 'OCR API key not configured on server' });
    }

    const formData = new FormData();
    formData.append('base64Image', image);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('scale', 'true');
    formData.append('isTable', 'true');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
         'apikey': apiKey,
      },
      body: formData,
    });

    const ocrResult = await ocrResponse.json();

    if (ocrResult.OCRExitCode !== 1) {
      console.error('OCR processing error:', ocrResult.ErrorMessage);
      return res.status(500).json({ error: ocrResult.ErrorMessage?.[0] || 'OCR processing failed' });
    }

    const parsedText = ocrResult.ParsedResults?.[0]?.ParsedText || '';

    return res.json({
      success: true,
      text: parsedText,
    });

  } catch (error: any) {
    console.error('OCR endpoint error:', error);
    return res.status(500).json({ error: `OCR processing failed: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
