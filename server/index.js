// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express and OpenAI
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API endpoint
app.post('/api/generate-travel-ideas', async (req, res) => {
  const { input } = req.body;

  if (!input || input.trim() === "") {
    return res.status(400).json({ error: 'Missing input' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful travel assistant. Suggest destinations, activities, and a rough budget based on user preferences.',
        },
        {
          role: 'user',
          content: input,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const suggestions = completion.choices[0].message.content;
    console.log('✅ AI Suggestions:', suggestions);
    res.json({ suggestions });
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.response?.data || error.message || error);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Failed to generate travel ideas'
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ TravelGenie is running at http://localhost:${PORT}`);
});
