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

var getHosts = function(id) {
  return new Promise(function(resolve, reject) {
    needle.get("https://tmi.twitch.tv/hosts?include_logins=1&target=" + id, { client_id: config.auth.cid }, (err, data) => {
      resolve(data.body.hosts);
    });
  });
};

var updateTwitch = function(status, game, channel, auth) {
  return new Promise(function(resolve, reject) {
    needle.put("https://api.twitch.tv/kraken/channels/" + channel + "?oauth_token=" + auth, {channel: { status: status, game: game } }, (err, data) => {
      resolve(data.body);
    });
  });
};

var isTwitchEditor = function(user, channel, auth) {
  return new Promise(function(resolve, reject) {
    needle.get("https://api.twitch.tv/kraken/channels/" + channel + "/editors?oauth_token=" + auth, (err, data) => {
      if (data.body.users) {
        var index = data.body.users.map(function(x) { return x.name; }).indexOf(user);
        if (index > -1 || user == channel) {
          resolve(true);
        }
        else {
          resolve(false);
        }
      }
      else {
        resolve(false);
      }
    });
  });
};

var getModChannels = function() {
  return new Promise(function(resolve, reject) {
    needle.get("https://twitchstuff.3v.fi/api/mods/heepsbot", (err, data) => {
      if (!err) {
        if (data.body.count) {
          resolve(data.body.count)
        }
        else {
          resolve("")
        }
      }
      else {
        resolve("")
      }
    });
  });
};

var isFollowing = function(user, channel) {
  return new Promise(function(resolve, reject) {
    needle.get("https://api.twitch.tv/kraken/users/" + user + "/follows/channels/" + channel + "?limit=1", (err, data) => {
      if (!data.body.error) {
        resolve(data.body.created_at)
      }
      else {
        resolve("")
      }
    });
  });
}

module.exports = {
  isAdmin: isAdmin,
  userLevel: userLevel,
  isEditor: isEditor,
  getChannel: getChannel,
  getHosts: getHosts,
  updateTwitch: updateTwitch,
  isTwitchEditor: isTwitchEditor,
  getModChannels: getModChannels,
  isFollowing: isFollowing
};
