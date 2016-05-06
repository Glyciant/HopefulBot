var config = require("./config");

var isAdmin = function(user) {
  if (config.twitch.admins.indexOf(user) > -1) {
    return true;
  }
  else {
    return false;
  }
};

var userLevel = function(object, data) {
  if (config.twitch.admins.indexOf(object.username) > -1) {
    return 1;
  }
  else if (object["user-type"] == "staff") {
    return 100;
  }
  else if (object["user-type"] == "admin") {
    return 200;
  }
  else if (object["user-type"] == "global_mod") {
    return 250;
  }
  else if (data.id.replace('#', '') == object.username) {
    return 300;
  }
  else if (data.regulars.indexOf(object.username) > -1) {
    return 400;
  }
  else if (object["user-type"] == "mod") {
    return 500;
  }
  else if (data.editors.indexOf(object.username) > -1) {
    return 600;
  }
  else if (object.subscriber === true) {
    return 700;
  }
  else if (object.turbo === true) {
    return 750;
  }
  else {
    return 800;
  }
};

module.exports = {
  isAdmin: isAdmin,
  userLevel: userLevel
};
