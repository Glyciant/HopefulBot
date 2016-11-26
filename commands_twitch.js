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
          username: "HopefulBot",
          password: config.twitch.bot
      },
      channels: ["#heep123", "#hopefulbot"]
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
  db.twitch_settings.getByTwitchUsername(channel).then(function(data) {
    data.enabled = true;
    twitchBot.join(channel);
    db.twitch_settings.update(data.user_id, data);
  });
};

var partChannel = function(channel) {
  db.twitch_settings.getByTwitchUsername(channel).then(function(data) {
    data.enabled = false;
    twitchBot.part(channel);
    db.twitch_settings.update(data.user_id, data);
  });
};

var rejoinChannel = function(channel) {
  db.twitch_settings.getByTwitchUsername(channel).then(function(data) {
    twitchBot.part(channel);
    twitchBot.join(channel);
  });
};

var resetBot = function(channel) {
  db.users.getUserIdByTwitchId(channel).then(function(data) {
    db.twitch_settings.getById(channel).then(function(result) {
      db.twitch_settings.delete(data).then(function() {
        db.twitch_settings.defaultSettings(data, channel, result[0].username, result[0].display_name, result[0].icon);
      });
    });
  });
};

function postMessage(channel, message, data) {
  helpers.twitch_settings.convertVariables(message, data, function(str) {
    twitchBot.say(channel, str);
  });
}

function postWhisper(channel, message, data) {
  helpers.twitch_settings.convertVariables(message, data, function(str) {
      twitchBot.whisper(channel, str);
  });
}

// Message Logging
twitchBot.on("message", function (channel, userstate, message, self) {
  var d = new Date(),
      date = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() + " " + d.getHours() + ":" + (d.getMinutes()<10?'0':'') + d.getMinutes() + ":" + (d.getSeconds()<10?'0':'') + d.getSeconds();
  db.twitch_logs.add(channel, userstate["display-name"], message, date);
});

// Define Spam Protection Variables
var purged = {},
    permitted = {};

// Action Protection
twitchBot.on("action", function(channel, userstate, message, self) {
  db.twitch_settings.getByTwitchUsername(channel.replace("#","")).then(function(data) {
    if (data.spam.actions.enabled === true) {
      if (data.spam.actions.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
        if (!purged[channel]) {
          purged[channel] = {};
        }
        var purgeTimeDiff = null;
        if (purged[channel][userstate.username]) {
          purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
        }
        if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.actions.warning === false) {
          twitchBot.timeout(channel, userstate.username, data.spam.actions.length, "HopefulBot Spam Protection: Action Filter [Timeout]");
          purged[channel][userstate.username] = null;
          var result = "Timeout";
        }
        else {
          twitchBot.timeout(channel, userstate.username, data.spam.actions.warning_length, "HopefulBot Spam Protection: Action Filter [Warning]");
          purged[channel][userstate.username] = Date.now() / 1000;
          var result = "Purge";
        }
        if (data.spam.actions.post_message === true) {
          if (data.spam.actions.whisper_message === true) {
            postWhisper(userstate.username, data.spam.actions.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
          }
          else {
            postMessage(channel, data.spam.actions.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
          }
        }
      }
    }
  });
});

twitchBot.on("message", function(channel, userstate, message, self) {
  if (self) {
    return;
  }
  db.twitch_settings.getByTwitchUsername(channel.replace("#","")).then(function(data) {

    var params = message.split(" ");

    // Blacklist Protection
    if (data.spam.blacklist.enabled === true) {
      for (var j in data.spam.blacklist.blacklist) {
        var pattern = data.spam.blacklist.blacklist[j];
        if (pattern.substring(0, 1) == "/" && pattern.substring(pattern.length - 1, pattern.length) == "/") {
          pattern = new RegExp(data.spam.blacklist.blacklist[j].slice(1, -1));
        }
        else {
          pattern = new RegExp(data.spam.blacklist.blacklist[j]);
        }
        if (pattern.test(message) === true) {
          var detected = true;
        }
      }
      if (detected) {
        if (data.spam.blacklist.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
          if (!purged[channel]) {
            purged[channel] = {};
          }
          var purgeTimeDiff = null;
          if (purged[channel][userstate.username]) {
            purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
          }
          if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.blacklist.warning === false) {
            twitchBot.timeout(channel, userstate.username, data.spam.blacklist.length, "HopefulBot Spam Protection: Blacklist Filter [Timeout]");
            purged[channel][userstate.username] = null;
            var result = "Timeout";
          }
          else {
            twitchBot.timeout(channel, userstate.username, data.spam.blacklist.warning_length, "HopefulBot Spam Protection: Blacklist Filter [Warning]");
            purged[channel][userstate.username] = Date.now() / 1000;
            var result = "Purge";
          }
          if (data.spam.blacklist.post_message === true) {
            if (data.spam.blacklist.whisper_message === true) {
              postWhisper(userstate.username, data.spam.blacklist.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
            }
            else {
              postMessage(channel, data.spam.blacklist.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
            }
          }
        }
      }
    }
    // Caps Protection
    if (data.spam.caps.enabled === true) {
      if (message.length >= data.spam.caps.minimum_length) {
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
        if (percentage >= data.spam.caps.percentage) {
          if (data.spam.caps.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
            if (!purged[channel]) {
              purged[channel] = {};
            }
            var purgeTimeDiff = null;
            if (purged[channel][userstate.username]) {
              purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
            }
            if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.caps.warning === false) {
              twitchBot.timeout(channel, userstate.username, data.spam.caps.length, "HopefulBot Spam Protection: Caps Filter [Timeout]");
              purged[channel][userstate.username] = null;
              var result = "Timeout";
            }
            else {
              twitchBot.timeout(channel, userstate.username, data.spam.caps.warning_length, "HopefulBot Spam Protection: Caps Filter [Warning]");
              purged[channel][userstate.username] = Date.now() / 1000;
              var result = "Purge";
            }
            if (data.spam.caps.post_message === true) {
              if (data.spam.caps.whisper_message === true) {
                postWhisper(userstate.username, data.spam.caps.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
              else {
                postMessage(channel, data.spam.caps.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
            }
          }
        }
      }
    }

    // Excess Emotes Protection
    if (data.spam.emotes.enabled === true) {
      var count = 0;
      if (userstate.emotes !== null) {
        for (var i in Object.keys(userstate.emotes)) {
          for (var j in userstate.emotes[Object.keys(userstate.emotes)[i]]) {
            count++;
          }
        }
      }
      if (count >= data.spam.emotes.limit) {
        if (data.spam.emotes.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
          if (!purged[channel]) {
            purged[channel] = {};
          }
          var purgeTimeDiff = null;
          if (purged[channel][userstate.username]) {
            purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
          }
          if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.emotes.warning === false) {
            twitchBot.timeout(channel, userstate.username, data.spam.emotes.length, "HopefulBot Spam Protection: Excess Emotes Filter [Timeout]");
            purged[channel][userstate.username] = null;
            var result = "Timeout";
          }
          else {
            twitchBot.timeout(channel, userstate.username, data.spam.emotes.warning_length, "HopefulBot Spam Protection: Excess Emotes Filter [Warning]");
            purged[channel][userstate.username] = Date.now() / 1000;
            var result = "Purge";
          }
          if (data.spam.emotes.post_message === true) {
            if (data.spam.emotes.whisper_message === true) {
              postWhisper(userstate.username, data.spam.emotes.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
            }
            else {
              postMessage(channel, data.spam.emotes.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
            }
          }
        }
      }
    }

    // Permit Command
    if (params[0] == data.command_prefix + "permit") {
      if (500 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
        permitUser(channel, channel, userstate, params, data);
      }
    }

    // IP Protection
    var ipRegex = new RegExp(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/),
        evasionRegex = new RegExp(/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|\[dot\]|\(dot\)|\[.\]|\(\.\)|\s\.\s)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|\[dot\]|\(dot\)|\[.\]|\(\.\)|\s\.\s)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|\[dot\]|\(dot\)|\[.\]|\(\.\)|\s\.\s)(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/),
        whitelist = data.spam.ips.whitelist;
    if (data.spam.ips.enabled === true) {
      for (var i in params) {
        var isAllowed = false;
        for (var j in whitelist) {
          if (helpers.general.matchRule(params[i],whitelist[j]) === true && whitelist[j] !== "") {
            isAllowed = true;
          }
        }
        if (isAllowed === true) {
          continue;
        }
        if (ipRegex.test(params[i]) || (data.spam.ips.prevent_evasion === true && evasionRegex.test(params[i]))) {
          if (data.spam.ips.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
            var name = userstate.username;
            if (data.spam.ips.permit && permitted[channel] && permitted[channel][name]) {
              var timeDiff = Date.now() / 1000 - permitted[channel][name];
              if (timeDiff <= 120) {
                permitted[channel][name] = null;
                return;
              }
            }
            if (!purged[channel]) {
              purged[channel] = {};
            }
            var purgeTimeDiff = null;
            if (purged[channel][userstate.username]) {
              purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
            }
            if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.ips.warning === false) {
              twitchBot.timeout(channel, userstate.username, data.spam.ips.length, "HopefulBot Spam Protection: IP Filter [Timeout]");
              purged[channel][userstate.username] = null;
              var result = "Timeout";
            }
            else {
              twitchBot.timeout(channel, userstate.username, data.spam.ips.warning_length, "HopefulBot Spam Protection: IP Filter [Warning]");
              purged[channel][userstate.username] = Date.now() / 1000;
              var result = "Purge";
            }
            if (data.spam.ips.post_message === true) {
              if (data.spam.ips.whisper_message === true) {
                postWhisper(userstate.username, data.spam.ips.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
              else {
                postMessage(channel, data.spam.ips.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
            }
          }
        }
      }
    }

    // Link Protection
    var linkRegex = new RegExp(/^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?(?::\d{2,5})?(?:[/?#]\S*)?$/),
        evasionRegex = new RegExp(/^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:(\.|\[dot\]|\(dot\)|\[.\]|\(\.\)|\s\.\s)(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:(\.|\[dot\]|\(dot\)|\[.\]|\(\.\)|\s\.\s)(?:[a-z\u00a1-\uffff]{2,}))(\.|\[dot\]|\(dot\)|\[.\]|\(\.\)|\s\.\s)?(?::\d{2,5})?(?:[/?#]\S*)?$/),
        whitelist = data.spam.links.whitelist;
    if (data.spam.links.enabled === true) {
      for (var i in params) {
        var isAllowed = false;
        for (var j in whitelist) {
          if (helpers.general.matchRule(params[i],whitelist[j]) === true && whitelist[j] !== "") {
            isAllowed = true;
          }
        }
        if (isAllowed === true) {
          continue;
        }
        if (linkRegex.test(params[i]) || (data.spam.links.prevent_evasion === true && evasionRegex.test(params[i]))) {
          if (data.spam.links.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
            var name = userstate.username;
            if (data.spam.links.permit && permitted[channel] && permitted[channel][name]) {
              var timeDiff = Date.now() / 1000 - permitted[channel][name];
              if (timeDiff <= 120) {
                permitted[channel][name] = null;
                return;
              }
            }
            if (!purged[channel]) {
              purged[channel] = {};
            }
            var purgeTimeDiff = null;
            if (purged[channel][userstate.username]) {
              purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
            }
            if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.links.warning === false) {
              twitchBot.timeout(channel, userstate.username, data.spam.links.length, "HopefulBot Spam Protection: Link Filter [Timeout]");
              purged[channel][userstate.username] = null;
              var result = "Timeout";
            }
            else {
              twitchBot.timeout(channel, userstate.username, data.spam.links.warning_length, "HopefulBot Spam Protection: Link Filter [Warning]");
              purged[channel][userstate.username] = Date.now() / 1000;
              var result = "Purge";
            }
            if (data.spam.links.post_message === true) {
              if (data.spam.links.whisper_message === true) {
                postWhisper(userstate.username, data.spam.links.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
              else {
                postMessage(channel, data.spam.links.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
            }
          }
        }
      }
    }

    // Lone Emotes Protection
    if (data.spam.lones.enabled === true) {
      if (userstate.emotes !== null) {
        var keys = Object.keys(userstate.emotes),
            indexes = userstate.emotes[keys[0]][0].split("-"),
            substring = message.substring(parseInt(indexes[0]), parseInt(indexes[1]) + 1),
            removedSubString = message.replace(substring, "");
        if (removedSubString.trim() === "") {
          if (data.spam.lones.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
            if (!purged[channel]) {
              purged[channel] = {};
            }
            var purgeTimeDiff = null;
            if (purged[channel][userstate.username]) {
              purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
            }
            if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.lones.warning === false) {
              twitchBot.timeout(channel, userstate.username, data.spam.lones.length, "HopefulBot Spam Protection: Lone Emotes Filter [Timeout]");
              purged[channel][userstate.username] = null;
              var result = "Timeout";
            }
            else {
              twitchBot.timeout(channel, userstate.username, data.spam.lones.warning_length, "HopefulBot Spam Protection: Lone Emotes Filter [Warning]");
              purged[channel][userstate.username] = Date.now() / 1000;
              var result = "Purge";
            }
            if (data.spam.lones.post_message === true) {
              if (data.spam.lones.whisper_message === true) {
                postWhisper(userstate.username, data.spam.lones.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
              else {
                postMessage(channel, data.spam.lones.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
            }
          }
        }
      }
    }

    // Paragraph Protection
    if (data.spam.paragraph.enabled === true) {
      if (message.length > data.spam.paragraph.limit) {
        if (data.spam.paragraph.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
          if (!purged[channel]) {
            purged[channel] = {};
          }
          var purgeTimeDiff = null;
          if (purged[channel][userstate.username]) {
            purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
          }
          if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.paragraph.warning === false) {
            twitchBot.timeout(channel, userstate.username, data.spam.paragraph.length, "HopefulBot Spam Protection: Paragraph Filter [Timeout]");
            purged[channel][userstate.username] = null;
            var result = "Timeout";
          }
          else {
            twitchBot.timeout(channel, userstate.username, data.spam.paragraph.warning_length, "HopefulBot Spam Protection: Paragraph Filter [Warning]");
            purged[channel][userstate.username] = Date.now() / 1000;
            var result = "Purge";
          }
          if (data.spam.paragraph.post_message === true) {
            if (data.spam.paragraph.whisper_message === true) {
              postWhisper(userstate.username, data.spam.paragraph.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
            }
            else {
              postMessage(channel, data.spam.paragraph.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
            }
          }
        }
      }
    }

    // Repitition Protection
    if (data.spam.repitition.enabled === true) {
      db.twitch_logs.getUserInChannel(channel, userstate["display-name"]).then(function(logs) {
        if (logs[0].message === logs[1].message) {
          if (data.spam.repitition.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
            if (!purged[channel]) {
              purged[channel] = {};
            }
            var purgeTimeDiff = null;
            if (purged[channel][userstate.username]) {
              purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
            }
            if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.repitition.warning === false) {
              twitchBot.timeout(channel, userstate.username, data.spam.repitition.length, "HopefulBot Spam Protection: Repitition Filter [Timeout]");
              purged[channel][userstate.username] = null;
              var result = "Timeout";
            }
            else {
              twitchBot.timeout(channel, userstate.username, data.spam.repitition.warning_length, "HopefulBot Spam Protection: Repitition Filter [Warning]");
              purged[channel][userstate.username] = Date.now() / 1000;
              var result = "Purge";
            }
            if (data.spam.repitition.post_message === true) {
              if (data.spam.repitition.whisper_message === true) {
                postWhisper(userstate.username, data.spam.repitition.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
              else {
                postMessage(channel, data.spam.repitition.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
            }
          }
        }
      });
    }
    if (data.spam.symbols.enabled === true) {
      if (message.length >= data.spam.symbols.minimum_length) {
        var symbolsCount = 0,
            spaceCount = 0;
        for (var i in message) {
          if (/[^A-Za-z0-9\s]/.test(message[i]) === true) {
            symbolsCount++;
          }
          else if (/\s/.test(message[i]) === true) {
            spaceCount++;
          }
        }
        var percentage = (symbolsCount / (message.length - spaceCount)) * 100;
        if (percentage >= data.spam.symbols.percentage) {
          if (data.spam.symbols.level < helpers.twitch_settings.getUserLevel(data, userstate)) {
            if (!purged[channel]) {
              purged[channel] = {};
            }
            var purgeTimeDiff = null;
            if (purged[channel][userstate.username]) {
              purgeTimeDiff = Date.now() / 1000 - purged[channel][userstate.username];
            }
            if ((purgeTimeDiff !== null && purgeTimeDiff <= 28800) || data.spam.symbols.warning === false) {
              twitchBot.timeout(channel, userstate.username, data.spam.symbols.length, "HopefulBot Spam Protection: symbols Filter [Timeout]");
              purged[channel][userstate.username] = null;
              var result = "Timeout";
            }
            else {
              twitchBot.timeout(channel, userstate.username, data.spam.symbols.warning_length, "HopefulBot Spam Protection: symbols Filter [Warning]");
              purged[channel][userstate.username] = Date.now() / 1000;
              var result = "Purge";
            }
            if (data.spam.symbols.post_message === true) {
              if (data.spam.symbols.whisper_message === true) {
                postWhisper(userstate.username, data.spam.symbols.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
              else {
                postMessage(channel, data.spam.symbols.message, { channel: channel.replace("#",""), user: userstate["display-name"], result: result });
              }
            }
          }
        }
      }
    }

    // Imp Command
    if (params[0] == data.command_prefix + "imp") {
      if (50 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
        db.twitch_settings.getByTwitchUsername(params[1]).then(function(actionData) {
          if (params[3] == "!permit" || params[3] == actionData[0].command_prefix + "permit" || params[3] == data.command_prefix + "permit") {
            permitUser(params[1], params[2], userstate, params, actionData);
          }
          else if (params[3] == "!editors" || params[3] == actionData[0].command_prefix + "editors" || params[3] == data.command_prefix + "editors") {
            if (params[4] == "add") {
              addEditor(params[1], params[2], userstate, actionData, params[5]);
            }
            else if (params[4] == "remove" || params[4] == "delete") {
              removeEditor(params[1], params[2], userstate, actionData, params[5]);
            }
            else if (params[4] == "list") {
              listEditors(params[1], params[2], userstate, actionData);
            }
            else {
              editorUsage(params[1], params[2], userstate, actionData);
            }
          }
          else if (params[3] == "!regulars" || params[3] == actionData[0].command_prefix + "regulars" || params[3] == data.command_prefix + "regulars") {
            if (params[4] == "add") {
              addRegular(params[1], params[2], userstate, actionData, params[5]);
            }
            else if (params[4] == "remove" || params[4] == "delete") {
              removeRegular(params[1], params[2], userstate, actionData, params[5]);
            }
            else if (params[4] == "list") {
              listRegulars(params[1], params[2], userstate, actionData);
            }
            else {
              regularUsage(params[1], params[2], userstate, actionData);
            }
          }
          else if (params[3] == "!restricted" || params[3] == actionData[0].command_prefix + "restricted" || params[3] == data.command_prefix + "restricted") {
            if (params[4] == "add") {
              addRestrictedUser(params[1], params[2], userstate, actionData, params[5]);
            }
            else if (params[4] == "remove" || params[4] == "delete") {
              removeRestrictedUser(params[1], params[2], userstate, actionData, params[5]);
            }
            else if (params[4] == "list") {
              listRestrictedUsers(params[1], params[2], userstate, actionData);
            }
            else {
              restrictedUserUsage(params[1], params[2], userstate, actionData);
            }
          }
        });
      }
    }

    // Manage Editors
    if (params[0] == data.command_prefix + "editors") {
      if (params[1] == "add") {
        if (300 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          addEditor(channel, channel, userstate, data, params[2]);
        }
      }
      else if (params[1] == "remove" || params[1] == "delete") {
        if (300 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          removeEditor(channel, channel, userstate, data, params[2]);
        }
      }
      else if (params[1] == "list") {
        if (500 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          listEditors(channel, channel, userstate, data);
        }
      }
      else {
        if (500 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          editorUsage(channel, channel, userstate, data);
        }
      }
    }

    // Manage Regulars
    if (params[0] == data.command_prefix + "regulars") {
      if (params[1] == "add") {
        if (400 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          addRegular(channel, channel, userstate, data, params[2]);
        }
      }
      else if (params[1] == "remove" || params[1] == "delete") {
        if (400 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          removeRegular(channel, channel, userstate, data, params[2]);
        }
      }
      else if (params[1] == "list") {
        if (500 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          listRegulars(channel, channel, userstate, data);
        }
      }
      else {
        if (500 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          regularUsage(channel, channel, userstate, data);
        }
      }
    }

    // Manage Restricted Users
    if (params[0] == data.command_prefix + "restricted") {
      if (params[1] == "add") {
        if (400 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          addRestrictedUser(channel, channel, userstate, data, params[2]);
        }
      }
      else if (params[1] == "remove" || params[1] == "delete") {
        if (400 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          removeRestrictedUser(channel, channel, userstate, data, params[2]);
        }
      }
      else if (params[1] == "list") {
        if (500 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          listRestrictedUsers(channel, channel, userstate, data);
        }
      }
      else {
        if (500 >= helpers.twitch_settings.getUserLevel(data, userstate)) {
          restrictedUserUsage(channel, channel, userstate, data);
        }
      }
    }
  });
});

function permitUser(channelAction, channelMessage, userstate, params, data) {
  if (data.spam.ips.permit === true || data.spam.links.permit === true) {
    if (data.spam.ips.permit === true && data.spam.links.permit === true) {
      twitchBot.say(channelMessage, userstate["display-name"] + " ->  " + params[1] + " has 120 seconds to post a link or IP.");
    }
    else if (data.spam.ips.permit === true) {
      twitchBot.say(channelMessage, userstate["display-name"] + " ->  " + params[1] + " has 120 seconds to post an IP.");
    }
    else if (data.spam.links.permit === true) {
      twitchBot.say(channelMessage, userstate["display-name"] + " ->  " + params[1] + " has 120 seconds to post a link.");
    }
    if (!permitted[channelAction]) {
      permitted[channelAction] = {};
    }
    permitted[channelAction][params[1].toLowerCase()] = Date.now() / 1000;
  }
  else {
    twitchBot.say(channelMessage, userstate["display-name"] + " -> The permit command is not enabled on this channel.");
  }
}

function addEditor(channelAction, channelMessage, userstate, data, user) {
  if (data.editors.map(function(x) { return x.username; }).indexOf(user.toLowerCase()) > -1) {
    twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " is already an editor.");
  }
  else {
    helpers.twitch_settings.getChannelByName(user).then(function(userData) {
      data.editors.push({ user: user, username: user.toLowerCase(), icon: userData.logo });
      db.twitch_settings.update(data.user_id, data);
      twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " has been added as an editor.");
    });
  }
}

function removeEditor(channelAction, channelMessage, userstate, data, user) {
  if (data.editors.map(function(x) { return x.username; }).indexOf(user.toLowerCase()) == -1) {
    twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " is not an editor.");
  }
  else {
    helpers.twitch_settings.getChannelByName(user).then(function(userData) {
      data.editors.splice(data.editors.map(function(x) { return x.username; }).indexOf(user.toLowerCase()), 1);
      db.twitch_settings.update(data.user_id, data);
      twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " has been removed as an editor.");
    });
  }
}

function listEditors(channelAction, channelMessage, userstate, data) {
  var editorObjects = [];
  for (var i in data.editors) {
    editorObjects.push(data.editors[i].user);
  }
  var editors = editorObjects.join(", ");
  twitchBot.say(channelMessage, userstate["display-name"] + " -> The editors of this channel are: " + editors);
}

function editorUsage(channelAction, channelMessage, userstate, data) {
  twitchBot.say(channelMessage, userstate["display-name"] + " -> Usage: " + data.command_prefix + "editors add|remove|delete|list");
}

function addRegular(channelAction, channelMessage, userstate, data, user) {
  if (data.regulars.map(function(x) { return x.username; }).indexOf(user.toLowerCase()) > -1) {
    twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " is already a regular.");
  }
  else {
    helpers.twitch_settings.getChannelByName(user).then(function(userData) {
      data.regulars.push({ user: user, username: user.toLowerCase(), icon: userData.logo });
      db.twitch_settings.update(data.user_id, data);
      twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " has been added as a regular.");
    });
  }
}

function removeRegular(channelAction, channelMessage, userstate, data, user) {
  if (data.regulars.map(function(x) { return x.username; }).indexOf(user.toLowerCase()) == -1) {
    twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " is not a regular.");
  }
  else {
    helpers.twitch_settings.getChannelByName(user).then(function(userData) {
      data.regulars.splice(data.regulars.map(function(x) { return x.username; }).indexOf(user.toLowerCase()), 1);
      db.twitch_settings.update(data.user_id, data);
      twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " has been removed as a regular.");
    });
  }
}

function listRegulars(channelAction, channelMessage, userstate, data) {
  var regularObjects = [];
  for (var i in data.regulars) {
    regularObjects.push(data.regulars[i].user);
  }
  var regulars = regularObjects.join(", ");
  twitchBot.say(channelMessage, userstate["display-name"] + " -> The regulars of this channel are: " + regulars);
}

function regularUsage(channelAction, channelMessage, userstate, data) {
  twitchBot.say(channelMessage, userstate["display-name"] + " -> Usage: " + data.command_prefix + "regulars add|remove|delete|list");
}

function addRestrictedUser(channelAction, channelMessage, userstate, data, user) {
  if (data.restricted.map(function(x) { return x.username; }).indexOf(user.toLowerCase()) > -1) {
    twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " is already a restricted user.");
  }
  else {
    helpers.twitch_settings.getChannelByName(user).then(function(userData) {
      data.restricted.push({ user: user, username: user.toLowerCase(), icon: userData.logo });
      db.twitch_settings.update(data.user_id, data);
      twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " has been added as a restricted user.");
    });
  }
}

function removeRestrictedUser(channelAction, channelMessage, userstate, data, user) {
  if (data.restricted.map(function(x) { return x.username; }).indexOf(user.toLowerCase()) == -1) {
    twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " is not a restricted user.");
  }
  else {
    helpers.twitch_settings.getChannelByName(user).then(function(userData) {
      data.restricted.splice(data.restricted.map(function(x) { return x.username; }).indexOf(user.toLowerCase()), 1);
      db.twitch_settings.update(data.user_id, data);
      twitchBot.say(channelMessage, userstate["display-name"] + " -> " + user + " has been removed as a restricted user.");
    });
  }
}

function listRestrictedUsers(channelAction, channelMessage, userstate, data) {
  var regularObjects = [];
  for (var i in data.restricted) {
    regularObjects.push(data.restricted[i].user);
  }
  var restricted = regularObjects.join(", ");
  twitchBot.say(channelMessage, userstate["display-name"] + " -> The restricted users of this channel are: " + restricted);
}

function restrictedUserUsage(channelAction, channelMessage, userstate, data) {
  twitchBot.say(channelMessage, userstate["display-name"] + " -> Usage: " + data.command_prefix + "restricted add|remove|delete|list");
}

module.exports = {
  joinChannel: joinChannel,
  partChannel: partChannel,
  rejoinChannel: rejoinChannel,
  resetBot: resetBot,
  permitUser: permitUser
};
