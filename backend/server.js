/**
 * Main server file for the authentication API.
 * Sets up Express server with middleware, routes, and starts the server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware for handling CORS, allowing requests from the frontend
app.use(cors({
  origin: 'http://localhost:3000', // Next.js dev server
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Passport configuration for OAuth
require('./config/passport')(passport);
app.use(passport.initialize());

// Routes for authentication
app.use('/api/auth', authRoutes);

// Default route for API status
app.get('/', (req, res) => {
  res.json({ message: 'Authentication API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
