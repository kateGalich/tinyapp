

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

module.exports = {generateRandomString, ifUserLoggedin};