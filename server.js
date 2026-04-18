require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname)));

app.use(cors({ origin: 'https://europeanyouthmovement.netlify.app' }));
app.use(express.json());

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email non valida' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        listIds: [4],
        updateEnabled: true
      })
    });

    if (response.ok || response.status === 204) {
      return res.json({ success: true });
    }

    const data = await response.json();
    if (data.code === 'duplicate_parameter') {
      return res.json({ success: true, duplicate: true });
    }

    return res.status(400).json({ error: data.message || 'Errore Brevo' });
  } catch (err) {
    return res.status(500).json({ error: 'Errore del server' });
  }
});

app.listen(3000, () => console.log('Server attivo su porta 3000'));