import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load .env into process.env
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve your frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Chat endpoint proxies to OpenAI
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a travel assistant. Provide destination suggestions, sample itineraries, accommodation options, and flight info.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8
        })
      }
    );

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to fetch from OpenAI.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
