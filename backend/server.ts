import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateVideo } from '../services/videoService.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// frontend calls this
app.post('/api/generate-video', async (req, res) => {
  try {
    const recipe = req.body;
    const video = await generateVideo(recipe);
    res.json(video);
  } catch (err: any) {
    console.error('❌ Error generating video:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('🚀 Backend running on http://localhost:5000'));
