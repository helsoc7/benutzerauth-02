const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register-Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send('Username or email already exists');
    }
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Login-Route
router.post('/login', async (req, res) => {
  console.log('Request Body:', req.body);
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (!user) {
      console.log('Invalid credentials:', usernameOrEmail, password); 
      return res.status(401).send('Invalid credentials');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid credentials:', usernameOrEmail, password); 
      return res.status(401).send('Invalid credentials');
    }
    req.session.user = user._id;
    console.log('Session after login:', req.session); 
    return res.send('Login successful');
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
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
  console.log('Session in protected route:', req.session); 
  if (req.session.user) {
    return res.send(`Hello ${req.session.user}, you are authenticated`);
  }
  res.status(401).send('You need to log in first');
});

module.exports = router;
