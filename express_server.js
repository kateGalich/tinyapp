const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const findUser = function (email) {
  for (let userKey in users) {
    let user = users[userKey];
    if (user.email === email) {

      return user;
    }
  }
  return null;
};

const generateRandomString = function () {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      characters.length));
  }
  return result;
};

const ifUserLoggedin = (user, res, redirectUrl) => {
  if (user) {
    res.redirect(redirectUrl);
    return true;
  }
  return false;
};

const renderError = function (req, res, message, statusCode = 400) {
  const templateVars = {
    user: users[req.cookies.user_id],
    message: message
  };
  res.status(statusCode);
  res.render("error", templateVars);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  if (!templateVars.user) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});


app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
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
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id],
  };
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
  delete urlDatabase[id];
  res.redirect('/urls');
});


app.post("/urls/:id/edit", (req, res) => { 
  const id = req.params.id;

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
});


app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
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

  const user = findUser(templateVars.email);

  if (!user) {
    renderError(req, res, 'Username and password not matched!', 401);
    return;
  } else if (templateVars.password !== user.password) {
    renderError(req, res, 'Username and password not matched!', 401);
    return;
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
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
    password: req.body.password
  };
  if (!templateVars.email || !templateVars.password) {
    renderError(req, res, 'Username and password can not be empty!');
    return;
  }

  if (findUser(templateVars.email)) {
    renderError(req, res, 'This user already exists!');
    return;
  }

  const id = generateRandomString();
  users[id] = {
    id: id,
    email: templateVars.email,
    password: templateVars.password
  };

  res.cookie('user_id', id);
  res.redirect('/urls');
});