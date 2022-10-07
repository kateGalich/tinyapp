
const getUserByEmail = function (email, database) {
  for (let userKey in database) {
    let user = database[userKey];
    if (user.email === email) {
      
      return user;
    }
  }
  return null;
};


module.exports = {getUserByEmail};