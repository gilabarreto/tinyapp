// DESCRIPTION: Server for TinyApp Project.

// Constants and Requires
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// EJS View Engine
app.set("view engine", "ejs");

// Express body-parser
app.use(express.urlencoded({ extended: true })); // body-parser package deprecated, use express built-in version.

app.use(cookieSession({
  name: 'session',
  keys: ['secretkeyfortinyapp'],
}))

// Function that returns a string of 6 random alphanumeric characters.
function generateRandomString() {
  return Math.random().toString(16).slice(2, 8);
}

// Function to check if the e-mail is already in the database.
function emailLookUp(email) {

  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user
    }
  }
  return null
}

// Function that returns the URLs where the userID is equal to the id of the currently logged-in user.
function urlsForUser(id) {

  const result = {};

  for (const shortlURL in urlDatabase) {
    const url = urlDatabase[shortlURL];
    if (url.userID === id) {
      result[shortlURL] = url;
    }
  }
  return result;
}

// Establish Server Connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

///////////////////
// GET Requests //
/////////////////


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Send Database as a Response
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET Route on /urls for a template to /urls_index.
app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]]
  const templateVars = { user: user, urls: urlsForUser(req.session["user_id"]) };
  res.render("urls_index", templateVars);
});

// GET Route for URL Submission Form
app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]]
  const templateVars = { user: user, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

// GET Route on /register for a template to /urls_register.
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_register", templateVars);
});

// GET Route on /newlogin for a template to /urls_login.
app.get("/newlogin", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
});

// GET Route on /:shortlURL for a template to /urls_show.
app.get("/urls/:shortURL", (req, res) => {

  const user = users[req.session["user_id"]]
  const urlObj = urlDatabase[req.params.shortURL]

  if (urlObj === undefined) {
    return res.send("That page doesn't exist.")
  }

  const longURL = urlObj.longURL

  if (urlObj.userID !== req.session["user_id"]) {
    return res.send("You don't have permission to access that page.")
  };

  const templateVars = { user: user, shortURL: req.params.shortURL, longURL: longURL };
  res.render("urls_show", templateVars);

});

// Redirect any Request to "/u/:shortURL" to its longURL.
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]

  if (!longURL) {
    return res.status(400).send("Short URL does not exist.")
  }

  res.redirect(longURL);

});

/////////////////////
// POST Resquests //
///////////////////

// POST Route to Receive the Form Submission.
app.post("/urls", (req, res) => {
  const user = users[req.session["user_id"]]
  const shortURL = generateRandomString();
  let { longURL } = req.body;

  if (!user) {
    return res.status(400).send("User is not logged in.")
  } else {
    if (!longURL.startsWith("http://") || !longURL.startsWith("https://")) {
      longURL = `http://${longURL}`
    };
    urlDatabase[shortURL] = { longURL: longURL, userID: user.id };
    return res.redirect(`/urls/${shortURL}`)
  }
});

// POST Route that Removes a URL Resource.
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session["user_id"]]
  const shortURL = req.params.shortURL;

  if (!user) {
    return res.send("You don't have permission to delete that page.")
  }
  delete urlDatabase[shortURL]
  res.redirect(`/urls`)
});

// POST Route that Updates a URL Resource.
app.post("/urls/:id", (req, res) => {
  const user = users[req.session["user_id"]]
  const shortURL = req.params.id;
  let { longURL } = req.body;

   if (!user) {
    return res.send("You don't have permission to update that page.")
  }
  if (!longURL.startsWith("http://") || !longURL.startsWith("https://")) {
    longURL = `http://${longURL}`
  };

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)
});

// POST Route Endpoint to Handle Register.
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (userEmail === "" || userPassword === "") {
    return res.status(400).send("E-mail and Password can not be blank, please try again.");
  }

  if (emailLookUp(userEmail)) {
    return res.status(400).send("E-mail already on our database.")
  }

  users[userID] = { id: userID, email: userEmail, password: hashedPassword };

  req.session.user_id = userID;
  req.session.user_id = userID;
  res.redirect(`/urls`);
});

// POST Route Endpoint to Handle Login.
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const user = emailLookUp(userEmail)

  if (user && bcrypt.compareSync(userPassword, user.password)) {
    req.session.user_id = user.id;
    urlsForUser(user.id)
    return res.redirect(`/urls`);
  } else if (user && !bcrypt.compareSync(userPassword, user.password)) {
    return res.status(403).send("Wrong Password.")
  } else {
    return res.status(403).send("User not found.")
  }

});

// POST Route Endpoint to /logout that Clears the user_id Cookie.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});