var config = require('./config'),
    db = require('./db'),
    moment = require('moment-timezone'),
    needle = require('needle');

var general = {
  isAdmin: function(user) {
    if (config.app.admins.indexOf(user) > -1) {
      return true;
    }
    else {
      return false;
    }
  },
  matchRule: function(str, rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
  }
};

var twitch_settings = {
  defaultSettings: function(user_id, id, username, display_name, icon) {
    return {
      user_id: user_id,
      id: id,
      display_name: display_name,
      username: username,
      enabled: true,
      command_prefix: "!",
      editors: [],
      regulars: [],
      restricted: [],
      icon: icon,
      autopoints: {
        chat: 0,
        follow: 0,
        sub: 0,
        join: 0,
        time: 0,
      },
      autowelcome: {
        message: "Welcome to the channel $(user). Thanks for stopping by! bleedPurple",
        enabled: false
      },
      claim: {
        amount: 0,
        users: [],
        enabled: false
      },
      countdown: {
        level: 600,
        enabled: true
      },
      emote: {
        level: 800,
        enabled: true
      },
      get: {
        chatters: true,
        followers: true,
        following: true,
        partnership: true,
        title: true,
        game: true,
        emotes: false,
        moderators: true,
        uptime: true,
        level: 800
      },
      highlights: {
        level: 800,
        enabled: false,
        times: []
      },
      love: {
        broadcaster: "$(user) -> $(channel)'s love for you cannot be put into words bleedPurple",
        bot: "$(user) -> Bots do not feel emotion, but I'd say the same to you if I did bleedPurple",
        enabled: true,
        level: 800
      },
      moderation: {
        ban: true,
        unban: true,
        timeout: true,
        purge: true,
        clear: true,
        slow: true,
        slowoff: true,
        subs: true,
        subsoff: true,
        r9k: true,
        r9koff: true,
        emoteonly: true,
        emoteonlyoff: true,
        level: 500,
      },
      magic: {
        level: 800,
        enabled: true,
        responses: [
          "Yes!",
          "No",
          "Huh? I... wasn't listening. :P",
          "I could answer that, but I'd have to ban you forever.",
          "The answer is unclear. Trust me, I double checked.",
          "YesNoYesNoYesNoYesNoYesNoYesNoYesNoYesNo Kappa",
          "So, you do think I'm clever?",
          "It's a coin flip really... :\\",
          "Maybe!",
          "Today, it's a yes. Tomorrow, it will be a no.",
          "Leave it with me.",
          "Ask the question to the nearest mirror three times, and answer will appear.",
          "Your answer has been posted and should arrive within 5 business days.",
          "Deal or no deal?",
          "Probably not, sorry bud.",
          "An answer to that question will cost £5. Are you paying by cash or card?",
          "Ask again later.",
          "Are you sure you would like to know that answer? I don't think you are.",
          "I doubt that.",
          "Sure thing!",
          "Yes, the outlook is good.",
          "I forgot the question, please repeat it.",
          "I don't see why not.",
          "Why would you ask that?"
        ]
      },
      nicknames: [],
      opemote: {
        level: 600,
        enabled: true
      },
      points: {
        name: "points",
        level: 800,
        enabled: false,
        totals: []
      },
      poll: {
        open: false,
        level: 800,
        topic: "",
        options: [],
        cost: 0,
        regular_multiplier: 1,
        sub_multiplier: 1
      },
      quotes: {
        level_add: 600,
        level_read: 800,
        enabled: true,
        quotes: []
      },
      raffle: {
        open: true,
        level: 800,
        cost: 0,
        regular_multiplier: 1,
        sub_multiplier: 1,
        exclude_cheaters: false,
        users: [],
        cheaters: [],
        key: ""
      },
      roulette: {
        chance: 3,
        level: 800,
        timeout: 30,
        enabled: true
      },
      shoutout: {
        channel: "",
        level_add: 500,
        level_read: 800,
        enabled: true
      },
      song_requests: {
        blacklist: [],
        songs: [],
        level: 800,
        enabled: false
      },
      spam: {
        actions: {
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not use coloured text. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        blacklist: {
          blacklist: [],
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not use banned words. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        caps: {
          minimum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not SHOUT in chat. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        emotes: {
          limit: 5,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not spam emotes. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        ips: {
          whitelist: [],
          permit: false,
          prevent_evasion: true,
          enabled: true,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not post IPs without a moderator's permission. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        links: {
          whitelist: [],
          permit: true,
          prevent_evasion: true,
          enabled: true,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not post links without a moderator's permission. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        lones: {
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not use lone emotes. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        paragraph: {
          limit: 350,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please keep messages short. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        repitition: {
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not repeat messages. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        symbols: {
          minimum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do spam symbols in chat. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        }
      },
      sub_welcome: {
        channel: {
          new: {
            message: "Thank you for subscribing $(user)! Your support is very much appreciated. bleedPurple",
            enabled: true
          },
          resub: {
            message: "Thank you for your continued support over the past $(months) months $(user)! bleedPurple",
            enabled: true
          }
        },
        host: {
          new: {
            message: "$(user) just subscribed to $(host)! bleedPurple",
            enabled: false
          },
          resub: {
            message: "$(user) just subscribed to $(host) for $(months) months in a row! bleedPurple",
            enabled: false
          }
        }
      },
      timers: []
    };
  },
  getChannelByName: function(user) {
    return new Promise(function(resolve, reject) {
      needle.get("https://api.twitch.tv/kraken/channels/" + user + "?client_id=" + config.twitch.auth.cid, (error, data) => {
        if (!error) {
          if (data.body.status == "422") {
            resolve("suspended");
          }
          else if (data.body.status == "404") {
            resolve("missing");
          }
          else {
            resolve(data.body);
          }
        }
        else {
          reject(error);
        }
      });
    });
  },
  getChannelById: function(id) {
    return new Promise(function(resolve, reject) {
      needle.get("https://api.twitch.tv/kraken/channels/" + id + "?client_id=" + config.twitch.auth.cid, { headers: { "Accept": "application/vnd.twitchtv.v5+json" } }, (error, data) => {
        if (!error) {
          if (data.body.status == "422") {
            resolve("suspended");
          }
          else if (data.body.status == "404") {
            resolve("missing");
          }
          else {
            resolve(data.body);
          }
        }
        else {
          reject(error);
        }
      });
    });
  },
  getStreamById: function(id) {
    return new Promise(function(resolve, reject) {
      needle.get("https://api.twitch.tv/kraken/streams/" + id + "?client_id=" + config.twitch.auth.cid, { headers: { "Accept": "application/vnd.twitchtv.v5+json" } }, (error, data) => {
        if (!error) {
          if (data.body.status == "422") {
            resolve("suspended");
          }
          else if (data.body.status == "404") {
            resolve("missing");
          }
          else {
            resolve(data.body);
          }
        }
        else {
          reject(error);
        }
      });
    });
  },
  getFollowingById: function(id) {
    return new Promise(function(resolve, reject) {
      needle.get("https://api.twitch.tv/kraken/users/" + id + "/follows/channels?client_id=" + config.twitch.auth.cid, { headers: { "Accept": "application/vnd.twitchtv.v5+json" } }, (error, data) => {
        if (!error) {
          if (data.body.status == "422") {
            resolve("suspended");
          }
          else if (data.body.status == "404") {
            resolve("missing");
          }
          else {
            resolve(data.body);
          }
        }
        else {
          reject(error);
        }
      });
    });
  },
  getFollowersById: function(id) {
    return new Promise(function(resolve, reject) {
      needle.get("https://api.twitch.tv/kraken/channels/" + id + "/follows?client_id=" + config.twitch.auth.cid, { headers: { "Accept": "application/vnd.twitchtv.v5+json" } }, (error, data) => {
        if (!error) {
          if (data.body.status == "422") {
            resolve("suspended");
          }
          else if (data.body.status == "404") {
            resolve("missing");
          }
          else {
            resolve(data.body);
          }
        }
        else {
          reject(error);
        }
      });
    });
  },
  getUsersByUsername: function(user) {
    return new Promise(function(resolve, reject) {
      needle.get("http://tmi.twitch.tv/group/user/" + user + "/chatters", (error, data) => {
        if (!error) {
          if (data.body.status == "422") {
            resolve("suspended");
          }
          else if (data.body.status == "404") {
            resolve("missing");
          }
          else {
            resolve(data.body);
          }
        }
        else {
          reject(error);
        }
      });
    });
  },
  getUptime: function(channel) {
    return new Promise(function(resolve, reject) {
      needle.get("https://decapi.me/twitch/uptime?channel=" + channel, (error, data) => {
        if (!error) {
          resolve(data.body);
        }
        else {
          reject(error);
        }
      });
    });
  },
  updateApiStatus: function(title, game, user, oauth) {
    return new Promise(function(resolve, reject) {
      needle.put("https://api.twitch.tv/kraken/channels/" + user + "?oauth_token=" + oauth, {
        channel: {
          status: title,
          game: game
        }
       }, (error, data) => {
        if (!error) {
          resolve(data.body);
        }
        else {
          reject(error);
        }
      });
    });
  },
  getUserLevel: function(data, user) {
    if (user.username == "heep123") {
      return 1;
    }
    else if (config.twitch.admins.indexOf(user.username) > -1) {
      return 50;
    }
    else if (user["user-type"] == "staff") {
      return 100;
    }
    else if (user["user-type"] == "admin") {
      return 200;
    }
    else if (user["user-type"] == "global_mod") {
      return 250;
    }
    else if (data.username == user.username) {
      return 300;
    }
    else if (data.editors.map(function(x) { return x.username; }).indexOf(user.username) > -1) {
      return 400;
    }
    else if (user.mod === true) {
      return 500;
    }
    else if (data.regulars.map(function(x) { return x.username; }).indexOf(user.username) > -1) {
      return 600;
    }
    else if (user.subscriber === true) {
      return 700;
    }
    else if (user.turbo === true) {
      return 750;
    }
    else if (data.restricted.map(function(x) { return x.username; }).indexOf(user.username) > -1) {
      return 900;
    }
    else {
      return 800;
    }
  },
  convertVariables: function(str, data, callback) {
    db.twitch_settings.getByTwitchUsername(data.channel).then(function(twitch) {
      db.users.get(twitch.user_id).then(function(user) {
        Promise.all([db.twitch_settings.getByUserId(user._id), twitch_settings.getChannelById(user.twitch_id), twitch_settings.getUptime(data.channel), twitch_settings.getFollowingById(user.twitch_id), twitch_settings.getUsersByUsername(data.channel), twitch_settings.getStreamById(user.twitch_id), twitch_settings.getFollowersById(user.twitch_id)]).then(function(channelData) {
          var splitStr = str.split(" ");
          for (var i in splitStr) {
            if (/\$\(countdown\((.*?)\)\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(countdown\((.*?)\)\)/),
                  args = find[1].split(","),
                  dateFuture = new Date(args[0], args[1]-1, args[2], args[3], args[4], args[5]),
                  dateNow = new Date(),
                  seconds = Math.floor((dateFuture - (dateNow))/1000),
                  minutes = Math.floor(seconds/60),
                  hours = Math.floor(minutes/60),
                  days = Math.floor(hours/24);
                  hours = hours-(days*24);
                  minutes = minutes-(days*24*60)-(hours*60);
                  seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);

              splitStr[i] = splitStr[i].replace(find[0], days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds");
            }
            if (/\$\(countup\((.*?)\)\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(countup\((.*?)\)\)/),
                  args = find[1].split(","),
                  datePast = new Date(args[0], args[1]-1, args[2], args[3], args[4], args[5]),
                  dateNow = new Date(),
                  seconds = Math.floor((dateNow - (datePast))/1000),
                  minutes = Math.floor(seconds/60),
                  hours = Math.floor(minutes/60),
                  days = Math.floor(hours/24);
                  hours = hours-(days*24);
                  minutes = minutes-(days*24*60)-(hours*60);
                  seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);

              splitStr[i] = splitStr[i].replace(find[0], days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds");
            }
            if (/\$\(randInt\((.*?)\)\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(randInt\((.*?)\)\)/),
                  args = find[1].split(","),
                  result = Math.floor(Math.random() * (parseInt(args[1]) - parseInt(args[0]) + 1) + parseInt(args[0]));

              splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(time\((.*?)\)\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(time\((.*?)\)\)/),
                  date = moment(new Date().toISOString()),
                  result = date.tz(find[1]).format("dddd Do MMMM YYYY, h:mm:ss a");

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(user\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(user\)/),
                  result = data.user;

                  if (!result) {
                    result = "$(user)"
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(channel\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(channel\)/),
                  result = data.channel;

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(nick\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(nick\)/),
                  result;

                  if (!data.user) {
                    result = "$(nick)"
                  }
                  else {
                    var nicknames = channelData[0].nicknames;
                    for (var i in nicknames) {
                      if (nicknames[i].username == data.user) {
                        result = nicknames[i].nickname;
                        break;
                      }
                    }
                    if (!result) {
                      result = data.user;
                    }
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(level\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(level\)/),
                  result;

                  if (!data.userstate) {
                    result = "$(level)";
                  }
                  else {
                    result = twitch_settings.getUserLevel(channelData[0], data.userstate);
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(uptime\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(uptime\)/),
                  result = channelData[2];

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(title\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(title\)/),
                  result = channelData[1].status;

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(directory\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(directory\)/),
                  result = channelData[1].game;

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(followers\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(followers\)/),
                  result = channelData[1].followers;

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(following\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(following\)/),
                  result = channelData[3]._total;

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(params\((.*?)\)\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(params\((.*?)\)\)/),
                  result;

                  if (!data.params || !data.params[find[1]]) {
                    result = find[0];
                  }
                  else {
                    result = data.params[find[1]];
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(randUser\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(randUser\)/),
                  users = channelData[4].chatters.viewers.concat(channelData[4].chatters.moderators, channelData[4].chatters.global_mods, channelData[4].chatters.admins + channelData[4].chatters.staff),
                  number = Math.floor(Math.random() * (users.length - 1) + 0),
                  result = users[number];

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(chatters\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(chatters\)/),
                  result = channelData[4].chatter_count;

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(viewers\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(viewers\)/),
                  stream = channelData[5].stream;

                  if (!stream) {
                    result = "Channel is not live.";
                  }
                  else {
                    result = stream.viewers;
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(count\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(count\)/),
                  result;

                  if (!data.count) {
                    result = "$(count)";
                  }
                  else {
                    result = data.count;
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(result\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(result\)/),
                  result;

                  if (!data.result) {
                    result = "$(result)";
                  }
                  else {
                    result = data.result;
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(latestSub\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(latestSub\)/),
                  result = channelData[0].latestSub;

                  if (!result) {
                    result = "$(latestSub)";
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
            if (/\$\(latestFollower\)/.test(splitStr[i]) === true) {
              var find = splitStr[i].match(/\$\(latestFollower\)/),
                  result = channelData[6].follows[0].user.display_name;

                  if (!result) {
                    result = "$(latestFollower)";
                  }

                  splitStr[i] = splitStr[i].replace(find[0], result);
            }
          }
          str = splitStr.join(" ");
          callback(str);
        });
      });
    });
  }
};

var discord_settings = {
  defaultSettings: function(user_id, server_id, server_name, server_icon) {
    return {
      user_id: user_id,
      server_name: server_name,
      server_id: server_id,
      command_prefix: "!",
      editors: [],
      regulars: [],
      restricted: [],
      server_icon: server_icon,
      autopoints: {
        chat: 0,
        time: 0,
      },
      autowelcome: {
        message: "Welcome to the server $(user). Thanks for stopping by!",
        channel: "",
        enabled: false
      },
      claim: {
        amount: 0,
        users: [],
        enabled: false
      },
      countdown: {
        level: 600,
        enabled: true
      },
      emote: {
        level: 800,
        enabled: true
      },
      get: {
        chatters: true,
        myid: true,
        region: true,
        owner: true,
        created: true,
        level: 800
      },
      love: {
        bot: "$(user) -> Bots do not feel emotion, but I'd say the same to you if I did. <3",
        enabled: true,
        level: 800
      },
      moderation: {
        ban: true,
        unban: true,
        kick: true,
        level: 500,
      },
      magic: {
        level: 800,
        enabled: true,
        responses: [
          "Yes!",
          "No",
          "Huh? I... wasn't listening. :P",
          "I could answer that, but I'd have to ban you forever.",
          "The answer is unclear. Trust me, I double checked.",
          "YesNoYesNoYesNoYesNoYesNoYesNoYesNoYesNo Kappa",
          "So, you do think I'm clever?",
          "It's a coin flip really... :\\",
          "Maybe!",
          "Today, it's a yes. Tomorrow, it will be a no.",
          "Leave it with me.",
          "Ask the question to the nearest mirror three times, and answer will appear.",
          "Your answer has been posted and should arrive within 5 business days.",
          "Deal or no deal?",
          "Probably not, sorry bud.",
          "An answer to that question will cost £5. Are you paying by cash or card?",
          "Ask again later.",
          "Are you sure you would like to know that answer? I don't think you are.",
          "I doubt that.",
          "Sure thing!",
          "Yes, the outlook is good.",
          "I forgot the question, please repeat it.",
          "I don't see why not.",
          "Why would you ask that?"
        ]
      },
      opemote: {
        level: 600,
        enabled: true
      },
      points: {
        name: "points",
        level: 800,
        enabled: false,
        totals: []
      },
      poll: {
        open: false,
        level: 800,
        topic: "",
        options: [],
        cost: 0,
        regular_multiplier: 1,
        sub_multiplier: 1
      },
      quotes: {
        level_add: 600,
        level_read: 800,
        enabled: true,
        quotes: []
      },
      raffle: {
        open: true,
        level: 800,
        cost: 0,
        regular_multiplier: 1,
        sub_multiplier: 1,
        exclude_cheaters: false,
        users: [],
        cheaters: [],
        key: ""
      },
      roulette: {
        chance: 3,
        level: 800,
        timeout: 30,
        enabled: true
      },
      shoutout: {
        channel: "",
        level_add: 500,
        level_read: 800,
        enabled: true
      },
      spam: {
        blacklist: {
          blacklist: [],
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not use banned words.",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        caps: {
          minimum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do SHOUT in chat.",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        ips: {
          whitelist: [],
          permit: false,
          prevent_evasion: true,
          enabled: true,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not post IPs without a moderator's permission. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        links: {
          whitelist: [],
          permit: true,
          prevent_evasion: true,
          enabled: true,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not post links without a moderator's permission.",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        paragraph: {
          limit: 750,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please keep messages short.",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        repitition: {
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not repeat messages.",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        symbols: {
          minimum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do spam symbols in chat.",
          post_message: true,
          warning: true,
          warning_length: 10
        }
      },
      timers: []
    };
  },
  getUserById: function(id) {
    return new Promise(function(resolve, reject) {
      needle.get("https://discordapp.com/api/users/" + id, (error, data) => {
        if (!error) {
          resolve(data.body);
        }
        else {
          reject(error);
        }
      });
    });
  }
};

var beam_settings = {
  defaultSettings: function(user_id, id, display_name, icon) {
    return {
      user_id: user_id,
      display_name: display_name,
      id: id,
      command_prefix: "!",
      editors: [],
      regulars: [],
      restricted: [],
      icon: icon,
      autopoints: {
        chat: 0,
        join: 0,
        time: 0,
      },
      autowelcome: {
        message: "Welcome to the channel $(user). Thanks for stopping by!",
        enabled: false
      },
      claim: {
        amount: 0,
        users: [],
        enabled: false
      },
      countdown: {
        level: 600,
        enabled: true
      },
      emote: {
        level: 800,
        enabled: true
      },
      get: {
        followers: true,
        partnership: true,
        viewers: true,
        level: 800
      },
      highlights: {
        level: 800,
        enabled: false,
        times: []
      },
      love: {
        broadcaster: "$(user) -> $(channel)'s love for you cannot be put into words. <3",
        bot: "$(user) -> Bots do not feel emotion, but I'd say the same to you if I did. <3",
        enabled: true,
        level: 800
      },
      moderation: {
        ban: true,
        unban: true,
        timeout: true,
        purge: true,
        clear: true,
        level: 500,
      },
      magic: {
        level: 800,
        enabled: true,
        responses: [
          "Yes!",
          "No",
          "Huh? I... wasn't listening. :P",
          "I could answer that, but I'd have to ban you forever.",
          "The answer is unclear. Trust me, I double checked.",
          "YesNoYesNoYesNoYesNoYesNoYesNoYesNoYesNo Kappa",
          "So, you do think I'm clever?",
          "It's a coin flip really... :\\",
          "Maybe!",
          "Today, it's a yes. Tomorrow, it will be a no.",
          "Leave it with me.",
          "Ask the question to the nearest mirror three times, and answer will appear.",
          "Your answer has been posted and should arrive within 5 business days.",
          "Deal or no deal?",
          "Probably not, sorry bud.",
          "An answer to that question will cost £5. Are you paying by cash or card?",
          "Ask again later.",
          "Are you sure you would like to know that answer? I don't think you are.",
          "I doubt that.",
          "Sure thing!",
          "Yes, the outlook is good.",
          "I forgot the question, please repeat it.",
          "I don't see why not.",
          "Why would you ask that?"
        ]
      },
      opemote: {
        level: 600,
        enabled: true
      },
      points: {
        name: "points",
        level: 800,
        enabled: false,
        totals: []
      },
      poll: {
        open: false,
        level: 800,
        topic: "",
        options: [],
        cost: 0,
        regular_multiplier: 1,
        sub_multiplier: 1
      },
      quotes: {
        level_add: 600,
        level_read: 800,
        enabled: true,
        quotes: []
      },
      roulette: {
        chance: 3,
        level: 800,
        timeout: 30,
        enabled: true
      },
      shoutout: {
        channel: "",
        level_add: 500,
        level_read: 800,
        enabled: true
      },
      song_requests: {
        blacklist: [],
        songs: [],
        level: 800,
        enabled: false
      },
      spam: {
        blacklist: {
          blacklist: [],
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not use banned words. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        caps: {
          minimum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not SHOUT in chat. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        emotes: {
          limit: 5,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not spam emotes. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        ips: {
          whitelist: [],
          permit: false,
          prevent_evasion: true,
          enabled: true,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not post IPs without a moderator's permission. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        links: {
          whitelist: [],
          permit: true,
          prevent_evasion: true,
          enabled: true,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not post links without a moderator's permission. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        paragraph: {
          limit: 350,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please keep messages short. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        repitition: {
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not repeat messages. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        symbols: {
          minimum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do spam symbols in chat. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        }
      },
      timers: []
    };
  },
  getChannel: function(user) {
    return new Promise(function(resolve, reject) {
      needle.get("https://beam.pro/api/v1/channels/" + user, (error, data) => {
        if (!error) {
          resolve(data.body);
        }
        else {
          reject(error);
        }
      });
    });
  }
};

module.exports = {
  general: general,
  twitch_settings: twitch_settings,
  discord_settings: discord_settings,
  beam_settings: beam_settings
};
