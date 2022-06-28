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

app.get("/urls", (req, res) => {
  const templateVars = {   username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET Route for URL Submission Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {   username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

// POST Route Endpoint to Handle Login.
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect(`/urls`);
});

// POST Route /logout endpoint that clears the username cookie and redirects the user back to the /urls page.
app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username", username);
  res.redirect(`/urls`);
});