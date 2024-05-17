const express = require('express');
const router = express.Router();

const users = { // Beispiel-Benutzer
  user1: 'password1',
  user2: 'password2',
};

// Login-Route
router.post('/login', (req, res) => {
  console.log('Request Body:', req.body); // Logge den Anfragekörper
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    req.session.user = username;
    console.log('Session after login:', req.session); // Logge die Sitzung
    return res.send('Login successful');
  }
  console.log('Invalid credentials:', username, password); // Logge ungültige Anmeldedaten
  return res.status(401).send('Invalid credentials');
});

// Logout-Route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.send('Logout successful');
  });
});

// Geschützte Route
router.get('/protected', (req, res) => {
  console.log('Session in protected route:', req.session); // Logge die Sitzung
  if (req.session.user) {
    return res.send(`Hello ${req.session.user}, you are authenticated`);
  }
  res.status(401).send('You need to log in first');
});

module.exports = router;
