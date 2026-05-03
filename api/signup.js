const { Router } = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = Router();

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

router.post('/', async (req, res) => {
  const { firstName, lastName, email, country, workingGroup, bio, phone } = req.body;

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
        ...(bio   && { BIO:   bio }),
        ...(phone && { PHONE: phone }),
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
      // Fire-and-forget: invite user to create a Supabase account
      const admin = getSupabaseAdmin();
      if (admin) {
        admin.auth.admin.inviteUserByEmail(email, {
          data: {
            first_name: firstName.trim(),
            last_name:  lastName.trim(),
          },
        }).then(({ data: inv, error: invErr }) => {
          if (!invErr && inv?.user) {
            // Pre-fill profile with all form data
            admin.from('profiles').upsert({
              id:            inv.user.id,
              email,
              first_name:    firstName.trim(),
              last_name:     lastName.trim(),
              country:       country       || '',
              working_group: workingGroup  || '',
              bio:           bio           || '',
              phone:         phone         || '',
            }, { onConflict: 'id' }).catch(() => {});
          }
        }).catch(() => {}); // never block the Brevo response
      }
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
