const { Router } = require('express');
const router = Router();

router.post('/', async (req, res) => {
  const { firstName, lastName, email, country, workingGroup } = req.body;

  if (!firstName || !lastName || !email || !email.includes('@') || !country) {
    return res.status(400).json({ error: 'All required fields must be filled in.' });
  }

  try {
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
      return res.json({ success: true });
    }

    const data = await response.json();
    if (data.code === 'duplicate_parameter') {
      return res.json({ success: true, duplicate: true });
    }

    return res.status(400).json({ error: data.message || 'Registration error.' });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
