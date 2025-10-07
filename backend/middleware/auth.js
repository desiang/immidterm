/**
 * Authentication middleware for JWT token verification.
 * Checks for a valid JWT token in the Authorization header.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware function to authenticate JWT tokens.
 * Extracts token from Authorization header, verifies it, and attaches user to req.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
