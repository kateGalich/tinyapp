const { generateRandomString } = require('./helpers');

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

const addUrl = function(longURL, userID) {
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL, userID
  };
  return id;
};

module.exports = { urlsForUser, urlDatabase, addUrl };
