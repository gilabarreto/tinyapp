// DESCRIPTION: Server for TinyApp Project.

// Constants and Requires
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// Express cookie-parser
app.use(cookieParser());

// Function that returns a string of 6 random alphanumeric characters.
function generateRandomString() {
  return Math.random().toString(16).slice(2, 8);
}

// Function to check if the e-mail is already in the database.
function emailLookUp(email) {

  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return true
    }
  }
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
  const user = users[req.cookies["user_id"]]
  const templateVars = { user: user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET Route for URL Submission Form
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]]
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
  const user = users[req.cookies["user_id"]]
  const templateVars = { user: user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// Redirect any Request to "/u/:shortURL" to its longURL.
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

/////////////////////
// POST Resquests //
///////////////////

// POST Route to Receive the Form Submission.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let { longURL } = req.body;
  if (!longURL.startsWith("http://") || !longURL.startsWith("https://")) {
    longURL = `http://${longURL}`
  };
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)
});

// POST Route that Removes a URL Resource.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]
  res.redirect(`/urls`)
});

// POST Route that Updates a URL Resource.
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  let { longURL } = req.body;
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
  console.log(users);

  if (userEmail === "" || userPassword === "") {
    return res.status(400).send("E-mail and Password can not be blank, please try again.");
  }

  if (emailLookUp(userEmail)) {
    return res.status(400).send("E-mail already on our database.")
  }

  users[userID] = { id: userID, email: userEmail, password: userPassword };

  res.cookie("user_id", userID);
  res.redirect(`/urls`);
});

// POST Route Endpoint to Handle Login.
app.post("/login", (req, res) => {
  const email = req.body.email;
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      res.cookie("user_id", userID);
      return res.redirect(`/urls`);
    }
  }
  res.send("Error");
});

// POST Route Endpoint to /logout that Clears the Username Cookie.
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});