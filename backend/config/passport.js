// Import the Google OAuth 2.0 strategy for Passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// Import the GitHub OAuth strategy for Passport.js
const GitHubStrategy = require('passport-github2').Strategy;
// Import the User model for database operations
const User = require('../models/User');

// Export a function that configures Passport with OAuth strategies
module.exports = (passport) => {
  // Configure the Google OAuth strategy
  // This strategy handles authentication via Google OAuth
  passport.use(new GoogleStrategy({
    // Client ID from Google OAuth app settings
    clientID: process.env.GOOGLE_CLIENT_ID,
    // Client secret from Google OAuth app settings
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Callback URL where Google will redirect after authentication
    // Relative URL that Passport will resolve to full URL based on request host
    callbackURL: '/api/auth/google/callback'
  },
  // Verify function called after Google authentication
  // Parameters: accessToken (for API calls), refreshToken (to refresh access), profile (user info), done (callback)
  // This function processes the user's profile and creates/finds the user in the database
  async (accessToken, refreshToken, profile, done) => {
    // Start try block to handle any database errors
    try {
      // Try to find an existing user by their Google OAuth ID and provider type
      let user = await User.findByOAuthId(profile.id, 'google');
      // Check if user was not found
      if (!user) {
        // If user doesn't exist, create a new OAuth user with Google profile data
        user = await User.createOAuthUser(profile, 'google');
        // Fetch the user again to get the complete user object with ID
        user = await User.findByOAuthId(profile.id, 'google');
      }
      // Call done with null error and user object to indicate successful authentication
      return done(null, user);
    } catch (err) {
      // If an error occurred during user lookup/creation, call done with error
      return done(err, null);
    }
  }));

  // Configure the GitHub OAuth strategy
  // This strategy handles authentication via GitHub OAuth
  passport.use(new GitHubStrategy({
    // Client ID from GitHub OAuth app settings
    clientID: process.env.GITHUB_CLIENT_ID,
    // Client secret from GitHub OAuth app settings
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // Callback URL where GitHub will redirect after authentication
    // Relative URL that Passport will resolve to full URL based on request host
    callbackURL: '/api/auth/github/callback'
  },
  // Verify function called after GitHub authentication
  // Parameters: accessToken (for API calls), refreshToken (to refresh access), profile (user info), done (callback)
  // This function processes the user's profile and creates/finds the user in the database
  async (accessToken, refreshToken, profile, done) => {
    // Start try block to handle any database errors
    try {
      // Try to find an existing user by their GitHub OAuth ID and provider type
      let user = await User.findByOAuthId(profile.id, 'github');
      // Check if user was not found
      if (!user) {
        // If user doesn't exist, create a new OAuth user with GitHub profile data
        user = await User.createOAuthUser(profile, 'github');
        // Fetch the user again to get the complete user object with ID
        user = await User.findByOAuthId(profile.id, 'github');
      }
      // Call done with null error and user object to indicate successful authentication
      return done(null, user);
    } catch (err) {
      // If an error occurred during user lookup/creation, call done with error
      return done(err, null);
    }
  }));

  // Serialize user function
  // This function determines what data from the user object should be stored in the session
  // Parameters: user (the authenticated user object), done (callback function)
  // Here, we store only the user ID for efficiency and security (not the entire user object)
  passport.serializeUser((user, done) => {
    // Call done with null error and the user ID to store in session
    done(null, user.id);
  });

  // Deserialize user function
  // This function retrieves the full user object from the database using the stored user ID
  // Parameters: id (the user ID stored in session), done (callback function)
  // Called on each request to get the current user for req.user
  passport.deserializeUser(async (id, done) => {
    // Start try block to handle database errors
    try {
      // Find the user by ID in the database
      const user = await User.findById(id);
      // Call done with null error and the full user object
      done(null, user);
    } catch (err) {
      // If an error occurred during user lookup, call done with error
      done(err, null);
    }
  });
};
