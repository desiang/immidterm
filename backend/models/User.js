/**
 * User model for handling user-related database operations.
 * Provides methods for creating, finding, updating users, and managing passwords and OAuth.
 */
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Creates a new user in the database.
   * @param {Object} userData - The user data object.
   * @param {string} userData.email - The user's email.
   * @param {string} userData.password - The user's password (will be hashed).
   * @param {string} userData.name - The user's name.
   * @returns {Promise} A promise that resolves with the database result.
   */
  static async create(userData) {
    const { email, password, name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
    return new Promise((resolve, reject) => {
      db.query(sql, [email, hashedPassword, name], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Finds a user by email.
   * @param {string} email - The user's email.
   * @returns {Promise<Object|null>} A promise that resolves with the user object or null if not found.
   */
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [email], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  /**
   * Finds a user by ID, excluding sensitive fields like password.
   * @param {number} id - The user's ID.
   * @returns {Promise<Object|null>} A promise that resolves with the user object or null if not found.
   */
  static async findById(id) {
    const sql = 'SELECT id, email, name, created_at FROM users WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  /**
   * Finds a user by ID, including password for authentication purposes.
   * @param {number} id - The user's ID.
   * @returns {Promise<Object|null>} A promise that resolves with the user object or null if not found.
   */
  static async findByIdWithPassword(id) {
    const sql = 'SELECT id, email, password, name, created_at FROM users WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  /**
   * Updates user fields by ID.
   * @param {number} id - The user's ID.
   * @param {Object} updates - An object with fields to update.
   * @returns {Promise} A promise that resolves with the database result.
   */
  static async updateById(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
    values.push(id);
    return new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Updates the user's password.
   * @param {number} id - The user's ID.
   * @param {string} newPassword - The new password (will be hashed).
   * @returns {Promise} A promise that resolves with the database result.
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [hashedPassword, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Sets a reset token for password reset.
   * @param {string} email - The user's email.
   * @param {string} token - The reset token.
   * @returns {Promise} A promise that resolves with the database result.
   */
  static async setResetToken(email, token) {
    const sql = 'UPDATE users SET reset_token = ? WHERE email = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [token, email], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Finds a user by reset token.
   * @param {string} token - The reset token.
   * @returns {Promise<Object|null>} A promise that resolves with the user object or null if not found.
   */
  static async findByResetToken(token) {
    const sql = 'SELECT * FROM users WHERE reset_token = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [token], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  /**
   * Clears the reset token after password reset.
   * @param {number} id - The user's ID.
   * @returns {Promise} A promise that resolves with the database result.
   */
  static async clearResetToken(id) {
    const sql = 'UPDATE users SET reset_token = NULL WHERE id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Creates a user from OAuth profile.
   * @param {Object} profile - The OAuth profile object.
   * @param {string} provider - The OAuth provider ('google' or 'github').
   * @returns {Promise} A promise that resolves with the database result.
   */
  static async createOAuthUser(profile, provider) {
    const { id, emails, displayName } = profile;
    const email = emails[0].value;
    const name = displayName;
    let sql, values;
    if (provider === 'google') {
      sql = 'INSERT INTO users (email, name, google_id) VALUES (?, ?, ?)';
      values = [email, name, id];
    } else if (provider === 'github') {
      sql = 'INSERT INTO users (email, name, github_id) VALUES (?, ?, ?)';
      values = [email, name, id];
    }
    return new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * Finds a user by OAuth ID.
   * @param {string} id - The OAuth ID.
   * @param {string} provider - The OAuth provider ('google' or 'github').
   * @returns {Promise<Object|null>} A promise that resolves with the user object or null if not found.
   */
  static async findByOAuthId(id, provider) {
    let sql;
    if (provider === 'google') {
      sql = 'SELECT * FROM users WHERE google_id = ?';
    } else if (provider === 'github') {
      sql = 'SELECT * FROM users WHERE github_id = ?';
    }
    return new Promise((resolve, reject) => {
      db.query(sql, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }
}

module.exports = User;
