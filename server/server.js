import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/chat', async (req, res) => {
  const { prompt, model = 'gpt-3.5-turbo' } = req.body;

  try {
    const openaiRes = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `
You are a travel assistant.
Return exactly three travel ideas as a JSON array—nothing else.
Each element must be an object with:
• title  (string)
• summary(string)
• details(string with \\n-separated lines)
              `.trim()
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8
        })
      }
    );

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('OpenAI returned error:', data);
      return res
        .status(openaiRes.status)
        .json({ error: data.error?.message || 'OpenAI error' });
    }

    // success: return exactly the content string
    return res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error('Request to OpenAI failed:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
