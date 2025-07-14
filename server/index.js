const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');

// Load .env variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (your public/index.html)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Set up OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// API Route
app.post('/api/generate-travel-ideas', async (req, res) => {
  const { input } = req.body;

  if (!input || input.trim() === "") {
    return res.status(400).json({ error: 'Missing input' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
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

    const suggestions = completion.data.choices[0].message.content;
    res.json({ suggestions });
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate travel ideas' });
  }
});

// IMPORTANT: Use Render's assigned port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
