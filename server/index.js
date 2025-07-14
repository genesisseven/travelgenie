const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/generate-travel-ideas', async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'Missing input' });

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful travel assistant. Suggest ideal travel destinations, itinerary highlights, and an approximate budget based on user preferences.',
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
    console.error('OpenAI Error:', error.message);
    res.status(500).json({ error: 'Failed to generate travel ideas' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
