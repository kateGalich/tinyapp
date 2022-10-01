const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);

});


app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;

  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});


app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('user_id', id);
  res.redirect('/urls');

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  const templateVars = {
    username: req.body.email,
    email: req.body.email,
    password: req.body.password
  };
  if (!templateVars.email || !templateVars.password) {
    res.status(400);
    res.send('Username and password can not be empty!');
    return;
  }

  if (findUser(templateVars.email)) {
    res.status(400);
    res.send('This user already exists!');
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