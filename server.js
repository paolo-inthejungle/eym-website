require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use('/api/subscribe', require('./api/subscribe'));
app.use('/api/signup', require('./api/signup'));
app.use('/api/apply-coordinator', require('./api/apply-coordinator'));
app.use('/api/auth', require('./api/auth'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
