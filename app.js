const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});