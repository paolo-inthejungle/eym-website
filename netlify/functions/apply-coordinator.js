exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const { name, email, country, message } = body;

  if (!name || !name.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Full name is required.' }) };
  }
  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'A valid email address is required.' }) };
  }
  if (!country) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Please select your country.' }) };
  }
  if (!message || !message.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'A motivation message is required.' }) };
  }

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

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'EYM Website', email: 'info@eym-europe.eu' },
      to: [{ email: 'info@eym-europe.eu', name: 'European Youth Movement' }],
      replyTo: { email: email.trim(), name: name.trim() },
      subject: `National Coordinator Application – ${country}`,
      htmlContent,
    }),
  });

  if (response.ok || response.status === 201) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  const data = await response.json().catch(() => ({}));
  return { statusCode: 500, body: JSON.stringify({ error: data.message || 'Failed to send application.' }) };
};
