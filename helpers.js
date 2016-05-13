var config = require("./config"),
    needle = require("needle");

var isAdmin = function(user) {
  if (config.twitch.admins.indexOf(user) > -1) {
    return true;
  }
  else {
    return false;
  }
};

var isEditor = function(user, object) {
  if (object.editors.indexOf(user) > -1) {
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

var getChannel = function(username) {
  return new Promise(function(resolve, reject) {
    needle.get("https://api.twitch.tv/kraken/channels/" + username, { client_id: config.auth.cid }, (err, data) => {
      if (data.body.status == "422") {
        resolve("suspended");
      }
      else if (data.body.status == "404") {
        resolve("missing");
      }
      else {
        resolve(data.body);
      }
    });
  });
};

module.exports = {
  isAdmin: isAdmin,
  userLevel: userLevel,
  isEditor: isEditor,
  getChannel: getChannel
};
