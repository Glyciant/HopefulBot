var tmi = require("tmi.js"),
    config = require("./config"),
    helpers = require("./helpers"),
    db = require("./db"),
    tmiOptions = {
      options: {
          debug: true
      },
      connection: {
          cluster: "aws",
          reconnect: true
      },
      identity: {
          username: "Heepsbot",
          password: config.twitch.bot
      },
      channels: ["#heep123", "#heepsbot"]
    },
    twitchBot = new tmi.client(tmiOptions);

// Connect to Twitch
twitchBot.connect();

// Begin Join Channels Function
twitchBot.on("connected", function (address, port) {
  console.log("[TWITCH] Login Successful!");
  joinAllChannels();
});

// Join Channels Function
function joinAllChannels() {
  db.twitch_settings.getAll().then(function(result) {
    for (var i in result) {
      if (result[i].enabled === true) {
        twitchBot.join(result[i].username);
      }
    }
  });
}

var joinChannel = function(channel) {
  db.twitch_settings.getByUsername(channel).then(function(data) {
    data[0].enabled = true;
    twitchBot.join(channel);
    db.twitch_settings.update(data[0].user_id, data[0])
  });
};

var partChannel = function(channel) {
  db.twitch_settings.getByUsername(channel).then(function(data) {
    data[0].enabled = false;
    twitchBot.part(channel);
    db.twitch_settings.update(data[0].user_id, data[0])
  });
};

var rejoinChannel = function(channel) {
  db.twitch_settings.getByUsername(channel).then(function(data) {
    twitchBot.part(channel);
    twitchBot.join(channel);
  });
};

var resetBot = function(channel) {
  db.users.getIdByTwitch(channel).then(function(data) {
    db.twitch_settings.getByUsername(channel).then(function(result) {
      db.twitch_settings.delete(data).then(function() {
        db.twitch_settings.defaultSettings(data, result[0].username, result[0].display_name, result[0].icon);
      });
    });
  });
};

// Define Spam Protection Variables
var purged = {},
    permitted = {};

// Action Protection
twitchBot.on("action", function (channel, userstate, message, self) {
  db.twitch_settings.getByUsername(channel.replace("#","")).then(function(data) {
    if (data[0].spam.actions.enabled === true) {
      if (data[0].spam.actions.level < helpers.twitch_settings.getUserLevel(data[0], userstate)) {
        if (!purged[channel]) {
          purged[channel] = {};
        }
        var purgeTimeDiff = null;
        if (purged[channel][userstate.username]) {
          purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
        }
        if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data[0].spam.actions.warning === false) {
          twitchBot.timeout(channel, userstate.username, data[0].spam.actions.length, "Heepsbot Spam Protection: Action Filter [Timeout]");
          purged[channel][userstate.username] = null;
          var result = "Timeout";
        }
        else {
          twitchBot.timeout(channel, userstate.username, data[0].spam.actions.warning_length, "Heepsbot Spam Protection: Action Filter [Warning]");
          purged[channel][userstate.username] = Date.now() / 1000;
          var result = "Purge";
        }
        if (data[0].spam.actions.post_message === true) {
          if (data[0].spam.actions.whisper_message === true) {
            twitchBot.whisper(userstate.username, data[0].spam.actions.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
          }
          else {
            twitchBot.say(channel, data[0].spam.actions.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
          }
        }
      }
    }
  });
});

// Blacklist Protection
twitchBot.on("message", function (channel, userstate, message, self) {
  db.twitch_settings.getByUsername(channel.replace("#","")).then(function(data) {
    if (data[0].spam.blacklist.enabled === true) {
      for (var j in data[0].spam.blacklist.blacklist) {
        var pattern = data[0].spam.blacklist.blacklist[j];
        if (pattern.substring(0, 1) == "/" && pattern.substring(pattern.length - 1, pattern.length) == "/") {
          pattern = new RegExp(data[0].spam.blacklist.blacklist[j].slice(1, -1));
        }
        else {
          pattern = new RegExp(data[0].spam.blacklist.blacklist[j]);
        }
        if (pattern.test(message) === true) {
          var detected = true;
        }
      }
      if (detected) {
        if (data[0].spam.blacklist.level < helpers.twitch_settings.getUserLevel(data[0], userstate)) {
          if (!purged[channel]) {
            purged[channel] = {};
          }
          var purgeTimeDiff = null;
          if (purged[channel][userstate.username]) {
            purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
          }
          if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data[0].spam.blacklist.warning === false) {
            twitchBot.timeout(channel, userstate.username, data[0].spam.blacklist.length, "Heepsbot Spam Protection: Blacklist Filter [Timeout]");
            purged[channel][userstate.username] = null;
            var result = "Timeout";
          }
          else {
            twitchBot.timeout(channel, userstate.username, data[0].spam.blacklist.warning_length, "Heepsbot Spam Protection: Blacklist Filter [Warning]");
            purged[channel][userstate.username] = Date.now() / 1000;
            var result = "Purge";
          }
          if (data[0].spam.blacklist.post_message === true) {
            if (data[0].spam.blacklist.whisper_message === true) {
              twitchBot.whisper(userstate.username, data[0].spam.blacklist.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
            }
            else {
              twitchBot.say(channel, data[0].spam.blacklist.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
            }
          }
        }
      }
    }
  });
});

// Caps Protection
twitchBot.on("message", function (channel, userstate, message, self) {
  db.twitch_settings.getByUsername(channel.replace("#","")).then(function(data) {
    if (data[0].spam.caps.enabled === true) {
      if (message.length >= data[0].spam.caps.minimum_length) {
        var capsCount = 0,
            spaceCount = 0;
        for (var i in message) {
          if (/[A-Z]/.test(message[i]) === true) {
            capsCount++;
          }
          else if (/\s/.test(message[i]) === true) {
            spaceCount++;
          }
        }
        var percentage = (capsCount / (message.length - spaceCount)) * 100;
        if (percentage >= data[0].spam.caps.percentage) {
          if (data[0].spam.caps.level < helpers.twitch_settings.getUserLevel(data[0], userstate)) {
            if (!purged[channel]) {
              purged[channel] = {};
            }
            var purgeTimeDiff = null;
            if (purged[channel][userstate.username]) {
              purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
            }
            if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data[0].spam.caps.warning === false) {
              twitchBot.timeout(channel, userstate.username, data[0].spam.caps.length, "Heepsbot Spam Protection: Caps Filter [Timeout]");
              purged[channel][userstate.username] = null;
              var result = "Timeout";
            }
            else {
              twitchBot.timeout(channel, userstate.username, data[0].spam.caps.warning_length, "Heepsbot Spam Protection: Caps Filter [Warning]");
              purged[channel][userstate.username] = Date.now() / 1000;
              var result = "Purge";
            }
            if (data[0].spam.caps.post_message === true) {
              if (data[0].spam.caps.whisper_message === true) {
                twitchBot.whisper(userstate.username, data[0].spam.caps.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
              }
              else {
                twitchBot.say(channel, data[0].spam.caps.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
              }
            }
          }
        }
      }
    }
  });
});

// Excess Emotes Protection
twitchBot.on("message", function (channel, userstate, message, self) {
  db.twitch_settings.getByUsername(channel.replace("#","")).then(function(data) {
    if (data[0].spam.emotes.enabled === true) {
      var count = 0;
      if (userstate.emotes !== null) {
        for (var i in Object.keys(userstate.emotes)) {
          for (var j in userstate.emotes[Object.keys(userstate.emotes)[i]]) {
            count++;
          }
        }
      }
      if (count >= data[0].spam.emotes.limit) {
        if (data[0].spam.emotes.level < helpers.twitch_settings.getUserLevel(data[0], userstate)) {
          if (!purged[channel]) {
            purged[channel] = {};
          }
          var purgeTimeDiff = null;
          if (purged[channel][userstate.username]) {
            purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
          }
          if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data[0].spam.emotes.warning === false) {
            twitchBot.timeout(channel, userstate.username, data[0].spam.emotes.length, "Heepsbot Spam Protection: Excess Emotes Filter [Timeout]");
            purged[channel][userstate.username] = null;
            var result = "Timeout";
          }
          else {
            twitchBot.timeout(channel, userstate.username, data[0].spam.emotes.warning_length, "Heepsbot Spam Protection: Excess Emotes Filter [Warning]");
            purged[channel][userstate.username] = Date.now() / 1000;
            var result = "Purge";
          }
          if (data[0].spam.emotes.post_message === true) {
            if (data[0].spam.emotes.whisper_message === true) {
              twitchBot.whisper(userstate.username, data[0].spam.emotes.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
            }
            else {
              twitchBot.say(channel, data[0].spam.emotes.message.replace("$(user)", userstate["display-name"]).replace("$(result)", result));
            }
          }
        }
      }
    }
  });
});


module.exports = {
  joinChannel: joinChannel,
  partChannel: partChannel,
  rejoinChannel: rejoinChannel,
  resetBot: resetBot
};
