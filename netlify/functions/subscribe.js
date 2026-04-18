exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  if (!email || !email.includes('@')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({ email, listIds: [4], updateEnabled: true }),
  });

  if (response.ok || response.status === 204) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  const data = await response.json();
  if (data.code === 'duplicate_parameter') {
    return { statusCode: 200, body: JSON.stringify({ success: true, duplicate: true }) };
  }

  return { statusCode: 400, body: JSON.stringify({ error: data.message || 'Brevo error' }) };
};
