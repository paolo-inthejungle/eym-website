const { Router } = require('express');
const router = Router();

router.post('/', async (req, res) => {
  const { name, email, country, message } = req.body;

  if (!name?.trim()) return res.status(400).json({ error: 'Full name is required.' });
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'A valid email address is required.' });
  if (!country) return res.status(400).json({ error: 'Please select your country.' });
  if (!message?.trim()) return res.status(400).json({ error: 'A motivation message is required.' });

  const htmlContent = `
    <p><strong>New National Coordinator Application</strong></p>
    <hr>
    <p><strong>Name:</strong> ${name.trim()}</p>
    <p><strong>Email:</strong> ${email.trim()}</p>
    <p><strong>Country:</strong> ${country}</p>
    <hr>
    <p><strong>Motivation:</strong></p>
    <p style="white-space:pre-line;">${message.trim()}</p>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'EYM Website', email: 'info@eym-europe.eu' },
        to: [{ email: 'join@eym-europe.eu', name: 'European Youth Movement' }],
        replyTo: { email: email.trim(), name: name.trim() },
        subject: `National Coordinator Application – ${country}`,
        htmlContent,
      }),
    });

    if (response.ok || response.status === 201) {
      return res.json({ success: true });
    }

    const data = await response.json().catch(() => ({}));
    return res.status(500).json({ error: data.message || 'Failed to send application.' });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
