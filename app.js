const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// MongoDB Verbindung
mongoose.connect('mongodb://localhost:27017/benutzerauth');

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
