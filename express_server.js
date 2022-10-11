const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, ifUserLoggedin } = require('./helpers');
const { users, getCurrentUser, getUserByEmail } = require('./users');
const {urlsForUser, urlDatabase} = require('./urls');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['loop'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));


//Show error page to user
const renderError = function(req, res, message, statusCode = 400) {
  const templateVars = {
    user: getCurrentUser(req),
    message: message
  };
  res.status(statusCode);
  res.render("error", templateVars);
};

app.get("/", (req, res) => {
  const user = getCurrentUser(req);
  res.redirect(user ? '/urls' : '/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let result = urlsForUser(req.session.user_id);
  const templateVars = {
    user: getCurrentUser(req),
    urls: result,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: getCurrentUser(req),
  };
  if (!templateVars.user) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const templateVars = {
    user: getCurrentUser(req),
  };
  if (!templateVars.user) {
    renderError(req, res, 'You must log in first');
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: templateVars.user.id
  };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[id].longURL,
    user: getCurrentUser(req),
  };
  if (!templateVars.user) {
    renderError(req, res, 'You must log in first');
    return;
  } else if (templateVars.user.id !== urlDatabase[id].userID) {
    renderError(req, res, 'Access is denied');
    return;
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (!longURL) {
    renderError(req, res, 'Url does not exists');
    return;
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = getCurrentUser(req);
  if (!user || user.id !== urlDatabase[id].userID) {
    renderError(req, res, 'Access is denied');
    return;
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  const user = getCurrentUser(req);
  const id = req.params.id;

  if (user.id !== urlDatabase[id].userID) {
    renderError(req, res, 'Access is denied');
    return;
  }

  urlDatabase[id].longURL = req.body.longURL;

  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: getCurrentUser(req)
  };
  if (ifUserLoggedin(templateVars.user, res, '/urls')) {
    return;
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const templateVars = {
    user: null,
    email: req.body.email,
    password: req.body.password
  };

  const user = getUserByEmail(templateVars.email, users);

  if (!user) {
    renderError(req, res, 'Username and password not matched!', 401);
    return;
  } else if (!bcrypt.compareSync(templateVars.password, user.password)) {
    renderError(req, res, 'Username and password not matched!', 401);
    return;
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: getCurrentUser(req)
  };
  if (ifUserLoggedin(templateVars.user, res, '/urls')) {
    return;
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const templateVars = {
    user: null,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  if (!templateVars.email || !templateVars.password) {
    renderError(req, res, 'Username and password can not be empty!');
    return;
  }

  if (getUserByEmail(templateVars.email, users)) {
    renderError(req, res, 'This user already exists!');
    return;
  }

  const id = generateRandomString();
  users[id] = {
    id: id,
    email: templateVars.email,
    password: templateVars.password
  };

  req.session.user_id = id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});