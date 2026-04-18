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

  const { firstName, lastName, email, country, workingGroup } = body;

  if (!firstName || !lastName || !email || !email.includes('@') || !country) {
    return { statusCode: 400, body: JSON.stringify({ error: 'All required fields must be filled in.' }) };
  }

  const contact = {
    email,
    attributes: {
      FIRSTNAME: firstName.trim(),
      LASTNAME: lastName.trim(),
      COUNTRY: country,
      ...(workingGroup && { WORKING_GROUP: workingGroup }),
    },
    listIds: [Number(process.env.BREVO_MEMBERS_LIST_ID) || 9],
    updateEnabled: true,
  };

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(contact),
  });

  if (response.ok || response.status === 204) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  const data = await response.json();

  if (data.code === 'duplicate_parameter') {
    return { statusCode: 200, body: JSON.stringify({ success: true, duplicate: true }) };
  }

  return { statusCode: 400, body: JSON.stringify({ error: data.message || 'Registration error.' }) };
};
