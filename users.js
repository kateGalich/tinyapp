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
    // password is 123
    password: "$2a$10$18hdKagp.BaaveVf4OWtIeD.mqr/ptK7K66bno1BygX.5dY4Hq7YO",
  }
};

const getCurrentUser = function(req) {
  const user = users[req.session.user_id];
  return user;
};

const getUserByEmail = function (email, database) {
  for (let userKey in database) {
    let user = database[userKey];
    if (user.email === email) {
      
      return user;
    }
  }
  return null;
};

module.exports = {users, getCurrentUser, getUserByEmail};

