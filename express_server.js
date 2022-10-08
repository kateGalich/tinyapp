const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['loop'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

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
  aJ48lW: {
    id: "aJ48lW",
    email: "kate@kate.com",
    password: "123",
  }
};

//Generating id for the url and the user DBs
const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
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

const renderError = function(req, res, message, statusCode = 400) {
  const templateVars = {
    user: users[req.session.user_id],
    message: message
  };
  res.status(statusCode);
  res.render("error", templateVars);
};

// Getting all the urls from the urlDB by userId
const urlsForUser = function(userId) {
  let urlsResult = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userId) {
      urlsResult[key] = {
        shortURL: key, longURL: urlDatabase[key].longURL, userID: userId
      };
    }
  }
  return urlsResult;
};


app.get("/", (req, res) => {
  const user = users[req.session.user_id];

  res.redirect(user ? '/urls' : '/login');
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let result = urlsForUser(req.session.user_id);
  const templateVars = {
    user: users[req.session.user_id],
    urls: result,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
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
    user: users[req.session.user_id],
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
  const user = users[req.session.user_id];
  if (!user || user.id !== urlDatabase[id].userID) {
    renderError(req, res, 'Access is denied');
    return;
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  const user = users[req.session.user_id];
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
    user: users[req.session.user_id]
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
    user: users[req.session.user_id]
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