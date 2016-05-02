var config = require("./config")

var isAdmin = function(user) {
  if (config.twitch.admins.indexOf(user) > -1) {
    return true
  }
  else {
    return false
  }
}

module.exports = {
  isAdmin: isAdmin
}
