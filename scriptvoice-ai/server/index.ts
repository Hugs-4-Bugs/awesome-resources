import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './genkit';
import { textToSpeech } from './tts';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/tts', async (req, res) => {
  console.log("Received TTS request");
  try {
    const { text } = req.body;
    console.log("Processing text:", text?.substring(0, 50) + "...");
    const audio = await textToSpeech(text);
    console.log("Audio generated successfully, length:", audio.length);
    res.json({ audio });
  } catch (err: any) {
    console.error("TTS Endpoint Error:", err);
    res.status(500).json({ error: err.message || 'TTS failed' });
  }
});

app.listen(4000, () => {
  console.log('Genkit TTS server running on http://localhost:4000');
});
