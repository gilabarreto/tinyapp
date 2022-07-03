// DESCRIPTION: Helper Functions for TinyApp Project

// Function to check if the e-mail is already in the database.
const getUserByEmail = function(email, database) {

  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Function that returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function(id, urlDatabase) {

  const result = {};

  for (const shortlURL in urlDatabase) {
    const url = urlDatabase[shortlURL];
    if (url.userID === id) {
      result[shortlURL] = url;
    }
  }
  return result;
};

// Function that returns a string of 6 random alphanumeric characters.
function generateRandomString() {
  return Math.random().toString(16).slice(2, 8);
}

module.exports = { getUserByEmail, urlsForUser, generateRandomString };