var config = require("./config"),
    db = require("./db"),
    helpers = require("./helpers"),
    schema = require("./schema"),
    express = require("express"),
    session = require("express-session"),
    app = express(),
    discord = require("discord.js"),
    tmi = require("tmi.js"),
    swig = require("swig"),
    needle = require("needle"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    thinky = require("thinky"),
    toggleSwitch = require("toggle-switch"),
    _ = require("underscore"),
    CronJob = require("cron").CronJob,
    bot = new discord.Client();

// Setup Stuff
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/views/static'));
app.use(cookieParser());
app.use(session({secret: 'anything', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.listen(config.app.port, function() {
  console.log('[DASHBOARD] Listing on port: ' + config.app.port);
});

app.locals = {
  authurl: config.auth.authurl
};

var channels = [];
db.twitch_settings.getAll().then(function(data) {
  for (var i in data) {
    channels.push(data[i].id);
  }

  channels.splice(channels.length - 1);

  if (channels.indexOf("#heepsbot") < 0) {
    channels.push("#heepsbot");
  }

  if (channels.indexOf("#heep123") < 0) {
    channels.push("#heep123");
  }

  var ircoptions = {
      options: {
          debug: true
      },
      connection: {
          cluster: "aws",
          reconnect: true
      },
      identity: {
          username: "Heepsbot",
          password: config.bot.twitch
      },
      channels: channels
  };

  var client = new tmi.client(ircoptions);
  client.connect();

  app.get('*', function(req, res, next) {
    app.locals.loggedin = req.session.display_name;
    app.locals.username = req.session.name;
    app.locals.isAdmin = helpers.isAdmin(app.locals.username);
    app.locals.authurl = config.auth.authurl + "&state=" + req.originalUrl;
  	next();
  });

  // API
  app.get('/api/v1/twitch/:user/', function(req, res) {
    db.twitch_settings.get("#" + req.params.user).then(function(data) {
      res.send(data[0]);
    });
  });

  app.get('/api/v1/twitch/:user/logs/', function(req, res) {
    db.twitch_logs.getChannel("#" + req.params.user).then(function(data) {
      res.send(data);
    });
  });

  app.get('/api/v1/discord/:id/', function(req, res) {
    db.discord_settings.get(req.params.id).then(function(data) {
      res.send(data[0]);
    });
  });

  app.get('/api/v1/discord/:id/logs/', function(req, res) {
    db.discord_logs.getAll(req.params.id).then(function(data) {
      res.send(data);
    });
  });

  app.get('/api/v1/commands/:user/', function(req, res) {
    db.commands.getAll("#" + req.params.user).then(function(data) {
      res.send(data);
    });
  });

  app.get('/api/*/', function(req, res) {
    res.send({error: 404, message: "API data not found."});
  });

  // Web Panel
  app.get('/', function(req, res) {
    res.render("index", {title: "Home", theme: "Neutral"});
  });

  app.get('/auth/login/', function(req, res) {
    var state = req.query.state;
    needle.post('https://api.twitch.tv/kraken/oauth2/token', {
  		client_id: config.auth.cid,
  		client_secret: config.auth.secret,
  		grant_type: 'authorization_code',
  		redirect_uri: config.app.baseurl + '/auth/login/',
  		code: req.query.code
  	}, function(err, resp, body) {
  		if(!err) {
  			needle.get('https://api.twitch.tv/kraken/user?oauth_token=' + body.access_token, function(error, data) {
          if(!error) {
  					req.session.auth = body.access_token;
  					req.session.name = data.body.name;
            req.session.display_name = data.body.display_name;
  					res.redirect(state);
  				}
          else{
  					res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Could not authenticate via the Twitch API."});
  				}
  			});
  		}
      else{
  			res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Twitch API appears to be having issues."});
  		}
  	});
  });

  app.get('/auth/logout/', function(req, res) {
  	req.session.destroy(function() {
  		res.redirect('/');
  	});
  });

  app.get('/help/', function(req, res) {
    res.render("index", {title: "Help", theme: "Neutral"});
  });

  app.get('*', function(req, res, next) {
    if (app.locals.loggedin) {
      next();
    }
    else {
      res.redirect(app.locals.authurl);
    }
  });

  app.get('/dashboard/', function(req, res) {
    db.twitch_settings.getAll().then(function(twitch) {
      db.discord_settings.getAll().then(function(discord) {
        var channels = [];
        for (var i in twitch) {
          var discordPos = discord.map(function(x) { return x.id; }).indexOf(twitch[i].discord)
          if (i !== "remove") {
            if (twitch[i].editors.indexOf(app.locals.username) > -1 || twitch[i].id == "#" + app.locals.username) {
              if (discord[discordPos]) {
                channels.push({twitch: twitch[i].id.replace("#", ""), twitch_name: twitch[i].name, twitch_image: twitch[i].logo, discord_id: twitch[i].discord, discord_name: discord[discordPos].name, discord_image: discord[discordPos].image });
              }
              else {
                channels.push({twitch: twitch[i].id.replace("#", ""), twitch_name: twitch[i].name, twitch_image: twitch[i].logo });
              }
            }
          }
        }
        res.render("dashboard", {title: "Dashboard", theme: "Neutral", data: channels});
      });
    });
  });

  app.get('/dashboard/:user/security/', function(req, res) {
    res.render("security", {title: "Manage Security", theme: "Neutral"});
  });

  app.get('/dashboard/:user/twitch/', function(req, res) {
    db.twitch_settings.get("#" + req.params.user).then(function(channel) {
      if (channel.length > 0) {
        if (helpers.isEditor(app.locals.username, channel[0]) || helpers.isAdmin(app.locals.username) || req.params.user == app.locals.username) {
          var editor = true;
        }
        if (helpers.isAdmin(app.locals.username) || req.params.user == app.locals.username) {
          var admin = true;
        }
        var editors = channel[0].editors,
            regulars = channel[0].regulars,
            exists = true,
            points = _.sortBy(channel[0].settings.points.totals, "total").reverse();
            raffle = channel[0].settings.raffle;
      }
      db.twitch_logs.getChannel("#" + req.params.user).then(function(twitch_chat_logs) {
        twitch_chat_logs = _.sortBy(twitch_chat_logs, "date").reverse();
        db.commands.getAll("#" + req.params.user).then(function(commands) {
          helpers.getChannel(req.params.user).then(function(twitch) {
            if (twitch !== "suspended") {
              if (twitch.display_name.substr(twitch.display_name.length - 1) == "s") {
                var ends = true;
              }
              var partner = twitch.partner,
                  status = twitch.status,
                  game = twitch.game;
            }
            if (channel.length > 0) {
              channel[0].name = twitch.display_name;
              channel[0].logo = twitch.logo;
              db.twitch_settings.update(channel[0].id, channel[0]);
            }
            helpers.getHosts(twitch._id).then(function(hosts) {
              helpers.isTwitchEditor(app.locals.username, req.params.user, req.session.auth).then(function(twitchEditor) {
                db.stats.get().then(function(main_stats) {
                  Promise.all([db.twitch_logs.getAll(), db.discord_logs.getAll(), db.discord_logs.bot(), db.twitch_logs.bot(), helpers.getModChannels()]).then(function(misc_stats) {
                    var stats = {};
                    stats.twitch_total = main_stats[0].twitch,
                    stats.discord_total = main_stats[0].discord,
                    stats.twitch_messages_logged = misc_stats[0].length,
                    stats.discord_messages_logged = misc_stats[1].length,
                    stats.discord_messages_sent = misc_stats[2].length,
                    stats.twitch_messages_sent = misc_stats[3].length,
                    stats.twitch_mod_total = misc_stats[4];
                    res.render("twitch", {title: "Twitch Dashboard", theme: "Twitch", owner: req.params.user, twitch_chat_logs: twitch_chat_logs, editors: editors, regulars: regulars, editor: editor, admin: admin, commands: commands, twitch: twitch, exists: exists, ends: ends, points: points, partner: partner, status: status, game: game, hosts: hosts, twitchEditor: twitchEditor, stats: stats, raffle: raffle });
                  })
                });
              });
            });
          });
        });
      });
    });
  });

  app.get('/dashboard/:server/discord/', function(req, res) {
    res.render("discord", {title: "Discord Dashboard", theme: "Discord"});
  });

  app.get('*', function(req, res) {
    res.render("error", {title: "404", theme: "Neutral", code: "404", description: "The page was not found."});
  });

  // Posts
  app.post('/twitch/users/add_editor/', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (data[0].editors.indexOf(req.body.editor) == -1) {
        data[0].editors.push(req.body.editor);
      }
      db.twitch_settings.update("#" + req.body.channel, data[0]);
    });
  });

  app.post('/twitch/users/add_regular/', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (data[0].regulars.indexOf(req.body.regular) == -1) {
        data[0].regulars.push(req.body.regular);
      }
      db.twitch_settings.update("#" + req.body.channel, data[0]);
    });
  });

  app.post('/twitch/users/remove_editor/', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      data[0].editors.splice(data[0].editors.indexOf(req.body.editor), 1);
      db.twitch_settings.update("#" + req.body.channel, data[0]);
    });
  });

  app.post('/twitch/users/remove_regular/', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      data[0].regulars.splice(data[0].regulars.indexOf(req.body.regular), 1);
      db.twitch_settings.update("#" + req.body.channel, data[0]);
    });
  });

  app.post('/twitch/commands/add', function(req, res) {
    req.body.level = parseInt(req.body.level);
    req.body.cost = parseInt(req.body.cost);
    req.body.add = parseInt(req.body.add);
    req.body.cooldown = parseInt(req.body.cooldown);
    req.body.count = 0;

    db.commands.add(req.body);
  });

  app.post('/twitch/commands/edit', function(req, res) {
    req.body.level = parseInt(req.body.level);
    req.body.cost = parseInt(req.body.cost);
    req.body.add = parseInt(req.body.add);
    req.body.cooldown = parseInt(req.body.cooldown);
    req.body.count = 0;

    db.commands.update(req.body);
  });

  app.post('/twitch/commands/delete', function(req, res) {
    db.commands.delete(req.body.id);
  });

  app.post('/twitch/points/get', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      var index = data[0].settings.points.totals.map(function(x) { return x.id; }).indexOf(req.body.user)
      if (index > -1) {
        res.status(200).send({ points: data[0].settings.points.totals[index].total});
      }
      else {
        res.status(200).send({ points: "0" });
      }
    });
  });

  app.post('/twitch/points/update', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (req.body.type !== "set") {
        var index = data[0].settings.points.totals.map(function(x) { return x.id; }).indexOf(req.body.user);
        if (index > -1) {
          var oldval = data[0].settings.points.totals[index].total
          data[0].settings.points.totals.splice(index, 1);
        }
        if (oldval) {
          data[0].settings.points.totals.push({id: req.body.user, total: parseInt(oldval) + parseInt(req.body.points)});
        }
        else {
          data[0].settings.points.totals.push({id: req.body.user, total: parseInt(req.body.points)});
        }
      }
      else {
        var index = data[0].settings.points.totals.map(function(x) { return x.id; }).indexOf(req.body.user);
        if (index > -1) {
          data[0].settings.points.totals.splice(index, 1);
        }
        data[0].settings.points.totals.push({id: req.body.user, total: parseInt(req.body.points)});
      }
      db.twitch_settings.update(data[0].id, data[0])
    });
  });

  app.post('/twitch/api/update/', function(req, res) {
    helpers.updateTwitch(req.body.status, req.body.game, req.body.channel, req.session.auth)
  });

  app.post('/twitch/raffle/open', function(req,res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      data[0].settings.raffle.open = false; // REMOVE THIS WHEN COMPLETED TESTING
      if (data[0].settings.raffle.open !== true) {
        if (!data[0].settings.raffle.key) {
          data[0].settings.raffle.open = true;
          data[0].settings.raffle.key = req.body.key;
          data[0].settings.raffle.cost = req.body.cost;
          data[0].settings.raffle.exclude_cheaters = (req.body.exclude_cheaters == "on");
          data[0].settings.raffle.regular_multiplier = parseInt(req.body.regular_multiplier);
          if (req.body.sub_multiplier) {
            data[0].settings.raffle.regular_subscriber = parseInt(req.body.sub_multiplier);
          }
          db.twitch_settings.update(data[0].id, data[0])
          if (req.body.cost > 0) {
            client.say("#" + req.body.channel, "Raffle is now open! Type " + req.body.key + " to enter (costs " + req.body.cost + " points).")
          }
          else {
            client.say("#" + req.body.channel, "Raffle is now open! Type " + req.body.key + " to enter.")
          }
          res.send({ action: "success", message: "The raffle has been opened!" });
        }
        else {
          res.send({ action: "error", message: "Error opening raffle: a raffle is set-up!" });
        }
      }
      else {
        res.send({ action: "error", message: "Error opening raffle: a raffle is already open!" });
      }
    })
  });

  app.post('/twitch/raffle/reopen', function(req,res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (data[0].settings.raffle.open === false) {
        if (data[0].settings.raffle.key) {
          data[0].settings.raffle.open = true;
          db.twitch_settings.update(data[0].id, data[0]);
          if (data[0].settings.raffle.cost > 0) {
            client.say("#" + req.body.channel, "Raffle is now re-open! Type " + data[0].settings.raffle.key + " to enter (costs " + data[0].settings.raffle.cost + " points).")
          }
          else {
            client.say("#" + req.body.channel, "Raffle is now re-open! Type " + data[0].settings.raffle.key + " to enter.")
          }
          res.send({ action: "success", message: "The raffle has been re-opened!" });
        }
        else {
          res.send({ action: "error", message: "Error re-opening raffle: a raffle has not been set-up!" });
        }
      }
      else {
        res.send({ action: "error", message: "Error re-opening raffle: the raffle is already open!" });
      }
    });
  });

  app.post('/twitch/raffle/close', function(req,res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (data[0].settings.raffle.open === true) {
        data[0].settings.raffle.open = false;
        db.twitch_settings.update(data[0].id, data[0]);
        client.say("#" + req.body.channel, "Raffle is closed. No more entires will be counted!")
        res.send({ action: "success", message: "The raffle has been closed!" });
      }
      else {
        res.send({ action: "error", message: "Error closing raffle: the raffle is not currently open!" });
      }
    });
  });

  app.post('/twitch/raffle/update', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      res.send(data[0].settings.raffle);
    });
  })

  app.post('/twitch/raffle/reset', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (data[0].settings.raffle.open === false) {
        data[0].settings.raffle.open = false;
        data[0].settings.raffle.key = null;
        data[0].settings.raffle.cost = null;
        data[0].settings.raffle.exclude_cheaters = null;
        data[0].settings.raffle.excluded_users = [];
        data[0].settings.raffle.users = [];
        data[0].settings.raffle.exclude_cheaters = null;
        data[0].settings.raffle.regular_multiplier = null;
        data[0].settings.raffle.subscriber_multiplier = null;
        db.twitch_settings.update(data[0].id, data[0]);
        res.send({ action: "success", message: "The raffle has been reset!" });
      }
      else {
        res.send({ action: "error", message: "Error resetting raffle: the raffle is currently open!" });
      }
    });
  })

  app.post('/twitch/raffle/draw', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (data[0].settings.raffle.open === false) {
        if (data[0].settings.raffle.key) {
          if (data[0].settings.raffle.users[0]) {
            var index = Math.floor((Math.random() * data[0].settings.raffle.users.length) + 1) - 1;
            helpers.getChannel(data[0].settings.raffle.users[index].name).then(function(twitch) {
              helpers.isFollowing(data[0].settings.raffle.users[index].name, req.body.channel).then(function(following) {
                res.send({
                  name: twitch.display_name,
                  icon: twitch.logo,
                  message: data[0].settings.raffle.users[index].message,
                  following: following,
                  subscriber: data[0].settings.raffle.users[index].subscriber
                });
              });
            });
          }
          else {
            res.send({ action: "error", message: "Error drawing raffle: nobody entered!" });
          }
        }
        else {
          res.send({ action: "error", message: "Error drawing raffle: a raffle has not been set-up!" });
        }
      }
      else {
        res.send({ action: "error", message: "Error drawing raffle: the raffle is currently open!" });
      }
    });
  });

  app.post('/twitch/raffle/announce', function(req, res) {
    if (req.body.user) {
      client.say("#" + req.body.channel, "A winner has been drawn: " + req.body.user + ". Congratulations!")
    }
    else {
      res.send({ action: "error", message: "Error announcing winner: could not find winner!" })
    }
  });

  app.post('/twitch/raffle/remove', function(req, res) {
    db.twitch_settings.get("#" + req.body.channel).then(function(data) {
      if (req.body.user) {
        for (var i = data[0].settings.raffle.users.length - 1; i >= 0; i--) {
          if (data[0].settings.raffle.users[i].name == req.body.user.toLowerCase()) {
            data[0].settings.raffle.users.splice(i, 1)
          }
        }
        db.twitch_settings.update(data[0].id, data[0]);
        res.send({ action: "success", message: req.body.user + "'s entries have been removed!" })
      }
      else {
        res.send({ action: "error", message: "Error removing entries: could not find user!" })
      }
    });
  })

  var twitchStats = new CronJob("* */5 * * * *", function() {
    db.stats.get().then(function(stats) {
      stats[0].twitch = client.getChannels().length;
      db.stats.update(stats[0])
    })
    }, function () {
      console.log("[STATS] CronJob Stopped.")
    },
    true);

  client.on("chat", function (channel, user, message, self) {
    var display_name = user["display-name"],
        date = new Date(),
        params = message.split(' ');

    // Logging
    db.twitch_logs.addEntry({"display_name": display_name, date: date, content: message, channel: channel});

    // Join Channel
    if (params[0] == ";join") {
      if (channel == "#heep123" || channel == "#heepsbot") {
        if ((user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) === true) && params[1]) {
          client.join("#" + params[1]);
          client.say("#" + params[1], "Hi! I have been sent to this channel by " + display_name + " in " + channel + ". If you don't want me here, type '~leave'. Otherwise, type '~setup' get started.");
          client.say(channel, display_name + " -> Joining channel #" + params[1] + "...");
        }
        else {
          client.join("#" + user.username);
          client.say("#" + user.username, "Hi! I have been sent to this channel by " + display_name + " in " + channel + ". If you don't want me here, type '~leave'. Otherwise, type '~setup' get started.");
          client.say(channel, display_name + " -> Joining channel #" + user.username + "...");
        }
      }
    }

    // Leave Channel
    if (params[0] == ";leave") {
      if (user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) === true || channel.replace("#","") == user.username) {
        client.say(channel, display_name + " -> Leaving channel...");
        client.leave(channel);
      }
    }

    // Setup
    if (params[0] == ";setup") {
      if (user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) === true || channel.replace("#","") == user.username) {
        db.twitch_settings.add({
          id: channel,
          username: channel.replace("#",""),
          discord: "",
          regulars: [],
          editors: [],
          settings: {
            api: {
              commands: true,
              aliases: true,
              twitch_settings: true,
              twitch_logs: true,
              discord_settings: true,
              discord_logs: true
            },
            spam: {
              links: 1000,
              caps: 1000,
              symbols: 1000,
              blacklist: 1000,
              paragraph: 1000,
              actions: 1000,
              settings: {
                links_whitelist: [],
                caps_percent: 60,
                caps_minimum: 6,
                symbols_percent: 60,
                symbols_minimum: 6,
                paragraph_limit: 350,
                banned_words: [],
                banned_regex: [],
                permit: true,
                permit_time: 120
              },
              messages: {
                links: "Links require approval by a moderator!",
                caps: "Please do not SHOUT in chat.",
                symbols: "Cut the symbol spam please.",
                blacklist: "That word/phrase isn't allowed here!",
                paragraph: "Please make messages shorter.",
                actions: "Do not use coloured text."
              }
            },
            commands: {
              love: 800,
              uptime: 800,
              get: 800,
              emote: 800,
              opemote: 500,
              pyramid: 500,
              moderators: 800,
              chatters: 800,
              countdown: 800,
              points: 800,
              moderation: 500,
              poll: 800,
              raffle: 800,
              song_requests: 800
            },
            autowelcome: {
              enabled: false,
              message: "Welcome to the stream, ^USER^!"
            },
            points: {
              name: "points",
              totals: []
            },
            autopoints: {
              join: 0,
              follow: 0,
              subscribe: 0,
              chat: 0
            },
            claim: {
              open: false,
              value: 0,
              users: []
            },
            song_requests: [],
            subwelcome: {
              channel: {
                new_enabled: false,
                old_enabled: false,
                new_message: "^USER^ just subscribed. Thank you so much! bleedPurple",
                old_message: "^USER^ just subscribed for the ^MONTHS^ month. Thank your for your continued support!"
              },
              host: {
                new_enabled: false,
                old_enabled: false,
                new_message: "^USER^ just subscribed to ^HOSTCHAN^!",
                old_message: "^USER^ just subscribed to ^HOSTCHAN^ for the ^MONTHS^ month!"
              }
            },
            poll: {
              open: false,
              topic: "",
              options: []
            },
            raffle: {
              open: false
            },
            magic: {
              level: 800,
              responses: [

              ]
            },
            roulette: {
              level: 800,
              timeout: 1,
              chance: 3
            },
            quotes: {
              readlevel: 800,
              addlevel: 600,
              quotes: []
            },
            shoutout: {
              readlevel: 800,
              addlevel: 500,
              channel: ""
            },
            highlights: {
              level: 600,
              times: []
            },
            timers: []
          }
        });
        client.say(channel, display_name + " -> Setup completed.");
      }
    }

    // Handle Discord
    if (params[0] == ";discord") {
      if (user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) === true || channel.replace("#","") == user.username) {
        if (params[1] == "getbot") {
          client.say(channel, display_name + " -> Get the Heepsbot for Discord here: https://discordapp.com/oauth2/authorize?&client_id=176399298655682571&scope=bot&permissions=335801375");
        }
        else if (params[1] == "server") {
          if (params[2]) {
            db.twitch_settings.get(channel).then(function(data) {
              data[0].discord = params[2];
              db.twitch_settings.update(channel, data[0]);
            });
            client.say(channel, display_name + " -> Discord server has been set.");
          }
          else {
            client.say(channel, display_name + " -> Please include a server ID in your message.");
          }
        }
      }
    }
    db.twitch_settings.get(channel).then(function(data) {
      var data = data[0];

      // 8Ball
      if (params[0] == ";8ball") {
        if (helpers.userLevel(user, data) <= data.settings.magic.level) {
          var answer = Math.floor(Math.random() * 24) + 1;
          if (answer == 1) { client.say(channel, display_name + " -> Yes!"); }
          if (answer == 2) { client.say(channel, display_name + " -> No!"); }
          if (answer == 3) { client.say(channel, display_name + " -> Huh? I... wasn't listening. :P"); }
          if (answer == 4) { client.say(channel, display_name + " -> I could answer that, but I'd have to ban you forever."); }
          if (answer == 5) { client.say(channel, display_name + " -> The answer is unclear. Trust me, I double checked."); }
          if (answer == 6) { client.say(channel, display_name + " -> YesNoYesNoYesNoYesNoYesNoYesNoYesNo :P"); }
          if (answer == 7) { client.say(channel, display_name + " -> So, you do think I'm clever?"); }
          if (answer == 8) { client.say(channel, display_name + " -> It's a coin flip really... :\\ "); }
          if (answer == 9) { client.say(channel, display_name + " -> Today, it's a yes. Tommorow, it will be a no."); }
          if (answer == 10) { client.say(channel, display_name + " -> Maybe!"); }
          if (answer == 11) { client.say(channel, display_name + " -> Leave it with me."); }
          if (answer == 12) { client.say(channel, display_name + " -> Ask the question to the nearest mirror three times, and the answer will appear."); }
          if (answer == 13) { client.say(channel, display_name + " -> Your answer has been posted and should arrive within the next 7 days."); }
          if (answer == 14) { client.say(channel, display_name + " -> Deal or no deal?"); }
          if (answer == 15) { client.say(channel, display_name + " -> Probably not, sorry bud."); }
          if (answer == 16) { client.say(channel, display_name + " -> An answer to that question will cost £5. Are you paying by cash or card?"); }
          if (answer == 17) { client.say(channel, display_name + " -> Ask again later."); }
          if (answer == 18) { client.say(channel, display_name + " -> Are you sure you'd like to know that answer? I don't think you are."); }
          if (answer == 19) { client.say(channel, display_name + " -> I doubt that."); }
          if (answer == 20) { client.say(channel, display_name + " -> Sure thing! I think..."); }
          if (answer == 21) { client.say(channel, display_name + " -> Yes, the outlook is good."); }
          if (answer == 22) { client.say(channel, display_name + " -> I forgot the question, please repeat it."); }
          if (answer == 23) { client.say(channel, display_name + " -> I don't see why not."); }
          if (answer == 24) { client.say(channel, display_name + " -> Why would you ask that?"); }
        }
      }

      // Roulette
      if (params[0] == ";roulette") {
        if (helpers.userLevel(user, data) <= data.settings.roulette.level) {
          var roulette = Math.floor(Math.random() * data.settings.roulette.chance) + 1;
          if (roulette == 1) {
            if (helpers.userLevel(user, data) <= 500) {
              client.say(channel, display_name + " -> BANG! You've been shot - but you're saved by your mod armour.");
            }
            else {
              client.timeout(channel, user.username, data.settings.roulette.timeout);
              client.say(channel, display_name + " -> BANG! You've been shot :(");
            }
          }
          else {
            client.say(channel, display_name + " -> Silence. You live to tell your story.");
          }
        }
      }

      // Love
      if (params[0] == ";love") {
        if (helpers.userLevel(user, data) <= data.settings.commands.love) {
          var love = Math.floor(Math.random() * 100) + 0;
          client.say(channel, "There is " + love + "% love between " + params[1] + " and " + display_name + " <3");
        }
      }

      // Shoutout
      if (params[0] == ";shoutout") {
        if (params[1] == "edit") {
          if (helpers.userLevel(user, data) <= data.settings.shoutout.addlevel) {
            if (params[2]) {
              data.settings.shoutout.channel = params[2];
              db.twitch_settings.update(channel, data);
              client.say(channel, display_name + " -> Shoutout channel updated.");
            }
            else {
              client.say(channel, display_name + " -> Please include a channel to shoutout.");
            }
          }
        }
        else {
          client.say(channel, "Make sure to check out " + data.settings.shoutout.channel + " over at http://twitch.tv/" + data.settings.shoutout.channel.toLowerCase());
        }
      }

      // Regulars
      if (params[0] == ";regulars") {
        if (helpers.userLevel(user, data) <= 400) {
          if (params[1] == "add") {
            if (params[2]) {
              data.regulars.push(params[2].toLowerCase());
              db.twitch_settings.update(channel, data);
              client.say(channel, display_name + " -> " + params[2] + " has been added as a regular.");
            }
            else {
              client.say(channel, display_name + " -> Please include a user to add as a regular.");
            }
          }
          else if (params[1] == "remove") {
            if (params[2]) {
              data.regulars.splice(data.regulars.indexOf(params[2]));
              db.twitch_settings.update(channel, data);
              client.say(channel, display_name + " -> " + params[2] + " has been removed as a regular.");
            }
            else {
              client.say(channel, display_name + " -> Please include a user to remove as a regular.");
            }
          }
        }
        if (params[1] == "list") {
          client.say(channel, display_name + " -> Regulars: " + data.regulars);
        }
      }

      // Editors
      if (params[0] == ";editors") {
        if (helpers.userLevel(user, data) <= 400) {
          if (params[1] == "add") {
            if (params[2]) {
              data.editors.push(params[2].toLowerCase());
              db.twitch_settings.update(channel, data);
              client.say(channel, display_name + " -> " + params[2] + " has been added as a editor.");
            }
            else {
              client.say(channel, display_name + " -> Please include a user to add as a editor.");
            }
          }
          else if (params[1] == "remove") {
            if (params[2]) {
              data.editors.splice(data.editors.indexOf(params[2]));
              db.twitch_settings.update(channel, data);
              client.say(channel, display_name + " -> " + params[2] + " has been removed as a editor.");
            }
            else {
              client.say(channel, display_name + " -> Please include a user to remove as a editor.");
            }
          }
        }
        if (params[1] == "list") {
          client.say(channel, display_name + " -> Editors: " + data.editors);
        }
      }

      // Commands
      db.commands.getAll(channels).then(function(commands) {
        // Edit/View Commands
        if (params[0] == ";commands") {
          if (params[1] == "add") {
            if (params[2] && params[3]) {
              db.commands.getCommand(params[2], channel).then(function(command) {
                if (command[0]) {
                  client.say(channel, display_name + " -> A command with that name already exists.");
                }
                else {
                  var commandText = message.replace(params[0] + " ", ""),
                      commandText = commandText.replace(params[1] + " ", ""),
                      commandText = commandText.replace(params[2] + " ", "");

                  if (commandText.indexOf("<ul>") >= 0 && commandText.indexOf("</ul>") >= 0) {
                    var level = parseInt(commandText.substring(commandText.lastIndexOf("<ul>")+4,commandText.lastIndexOf("</ul>")));
                    if (isNaN(level)) {
                      var level = 0;
                    }
                  }
                  else {
                    var level = 0;
                  }
                  if (commandText.indexOf("<pc>") >= 0 && commandText.indexOf("</pc>") >= 0) {
                    var cost = parseInt(commandText.substring(commandText.lastIndexOf("<pc>")+4,commandText.lastIndexOf("</pc>")));
                    if (isNaN(cost)) {
                      var cost = 0;
                    }
                  }
                  else {
                    var cost = 0;
                  }
                  if (commandText.indexOf("<ap>") >= 0 && commandText.indexOf("</ap>") >= 0) {
                    var add = parseInt(commandText.substring(commandText.lastIndexOf("<ap>")+4,commandText.lastIndexOf("</ap>")));
                    if (isNaN(add)) {
                      var add = 0;
                    }
                  }
                  else {
                    var add = 0;
                  }
                  if (commandText.indexOf("<cd>") >= 0 && commandText.indexOf("</cd>") >= 0) {
                    var cooldown = parseInt(commandText.substring(commandText.lastIndexOf("<cd>")+4,commandText.lastIndexOf("</cd>")));
                    if (isNaN(cooldown)) {
                      var cooldown = 0;
                    }
                  }
                  else {
                    var cooldown = 0;
                  }

                  commandText = commandText.replace(/(<[A-z]{1,3}>.*<\/[A-z]{1,3}>)/g, "");
                  commandText = commandText.trim();

                  db.commands.add({
                    name: params[2],
                    response: commandText,
                    channel: channel,
                    level: level,
                    cost: cost,
                    add: add,
                    cooldown: cooldown,
                    reactivate_twitch: null,
                    reactivate_discord: null,
                    count: 0
                  });
                  client.say(channel, display_name + " -> Command " + params[2] + " has been added.");
                }
              });
            }
          }
          else if (params[1] == "list") {

          }
          else if (params[1] == "remove") {
            db.commands.getCommand(params[2], channel).then(function(command) {
              if (command[0]) {
                db.commands.delete(command[0].id);
                client.say(channel, display_name + " -> Command " + params[2] + " has been deleted.");
              }
              else {
                client.say(channel, display_name + " -> A command with that name does not exist.");
              }
            });
          }
        }

        // Trigger Commands
        db.commands.getCommand(params[0], channel).then(function(command) {
          if (command[0]) {
            var command = command[0];
            client.say(channel, command.response);
            command.count = command.count + 1;
            db.commands.update(command);
          }
        });

        // Enter Raffle
        if (params[0] == data.settings.raffle.key) {
          if (data.settings.raffle.open === true) {
            if (!data.settings.raffle.users[0] || data.settings.raffle.excluded_users.indexOf(user.username) == -1) {
              if (!data.settings.raffle.users[0] || data.settings.raffle.users.map(function(x) { return x.name; }).indexOf(user.username) == -1) {
                if (helpers.userLevel(user, data) <= 600) {
                  var i = parseInt(data.settings.raffle.regular_multiplier);
                }
                else if (helpers.userLevel(user, data) <= 700) {
                  var i = parseInt(data.settings.raffle.sub_multiplier);
                }
                else {
                  var i = 1;
                }
                var j = 1,
                    arr = [];
                while (i >= j) {
                  var obj = {
                    name: user.username,
                    message: message.replace(params[0], "").trim(),
                    subscriber: user.subscriber
                  }
                  data.settings.raffle.users.push(obj)
                  j++;
                }
              }
              else {
                if (data.settings.raffle.exclude_cheaters == true) {
                  for (var i = data.settings.raffle.users.length - 1; i >= 0; i--) {
                    if (data.settings.raffle.users[i].name == user.username) {
                      if (data.settings.raffle.excluded_users.indexOf(user.username) == -1) {
                        data.settings.raffle.excluded_users.push(user.username)
                      }
                      data.settings.raffle.users.splice(i, 1)
                    }
                  }
                }
              }
              db.twitch_settings.update(data.id, data)
            }
          }
        }
      });
    });
  });
  client.on("host", function(channel, username, viewers) {
    client.say(channel, username + " is now hosting you for " + viewers + "viewers!")
  });
});

function discordlogin() {
  bot.loginWithToken(config.bot.discord).then(success).catch(err);
  function success(token){ console.log("[DISCORD] Login Successful!"); }
  function err(error){ console.log("[DISCORD] Login Failed! Arguments: " + arguments); }
}

discordlogin();

var discordStats = new CronJob("* */5 * * * *", function() {
  db.stats.get().then(function(stats) {
    stats[0].discord = bot.servers.length;
    db.stats.update(stats[0])
  })
  }, function () {
    console.log("[STATS] CronJob Stopped.")
  },
  true);


bot.on("disconnected", function() {
  discordlogin();
})

bot.on("message", function(message) {
  var author_id = message.author.id,
      channel_id = message.channel.id,
      server_id = message.channel.server.id,
      author = message.author.username,
      channel = message.channel.name,
      server = message.channel.server.name,
      server_image = message.channel.server.iconURL,
      content = message.content,
      params = content.split(' '),
      message_id = message.id,
      date = new Date();

  // Logging
  db.discord_logs.addEntry({id: message_id, author_id: author_id, author: author, channel: channel, server_id: server_id, content: content, date: date});

  // Get Server ID
  if (params[0] == "-serverid") {
    bot.reply(message, "This server's ID is: " + server_id);
  }

  // Setup
  if (params[0] == "-setup") {
    bot.createChannel(server_id, "bot_log", "text", function(err, logchan) {
      bot.createRole(server_id, {
        name: "HeepsBot Editor",
        color: 0x3498db,
        hoist: false,
        permissions: [
          "readMessages",
          "readMessageHistory"
        ]
      }, function(err, role) {
        db.discord_settings.add({
          id: server_id,
          twitch: "",
          editor_role: role.id,
          log_channel: logchan.id,
          name: server,
          editors: [],
          settings: {
            spam: {
              links: false,
              caps: false,
              symbols: false,
              blacklist: false,
              banned_words: false
            },
            commands: {
              magic: true,
              love: true,
              all_users: true,
              uuid: true,
              uptime: true,
              get: true,
              bot_sucks: true
            },
            poll: {
              open: false,
              topic: "",
              options: []
            },
            raffle: {
              open: false,
              users: []
            },
            roulette: {
              enabled: true,
              chance: 3
            }
          }
        });
        bot.reply(message, "Setup Complete");
      });
    });
  }

  // Handle Twitch
  if (params[0] == "-twitch") {
    if (params[1] == "channel") {
      if (params[2]) {
        db.twitch_settings.getLink(server_id).then(function(link) {
          if (link !== [] && link[0].id == "#" + params[2]) {
            db.discord_settings.get(server_id).then(function(data) {
              data[0].twitch = "#" + params[2];
              db.discord_settings.update(server_id, data[0]);
            });
            bot.reply(message, "Twitch channel has been set.");
          }
          else {
            bot.reply(message, "Could not set channel; the channel named has not set this server as theirs.");
          }
        });
      }
      else {
        bot.reply(message, "Please include a Twitch username in your message.");
      }
    }
  }

  db.discord_settings.get(server_id).then(function(data) {
    var data = data[0];

    // Update DB
    data.name = server;
    data.image = server_image;
    db.discord_settings.update(data.id, data);

    // 8Ball
    if (params[0] == "-8ball") {
      if (data.settings.commands.magic === true) {
        var answer = Math.floor(Math.random() * 24) + 1;
    		if (answer == 1) { bot.reply(message, "Yes!"); }
    		if (answer == 2) { bot.reply(message, "No!"); }
    		if (answer == 3) { bot.reply(message, "Huh? I... wasn't listening. :P"); }
    		if (answer == 4) { bot.reply(message, "I could answer that, but I'd have to ban you forever."); }
    		if (answer == 5) { bot.reply(message, "The answer is unclear. Trust me, I double checked."); }
    		if (answer == 6) { bot.reply(message, "YesNoYesNoYesNoYesNoYesNoYesNoYesNo :P"); }
    		if (answer == 7) { bot.reply(message, "So, you do think I'm clever?"); }
    		if (answer == 8) { bot.reply(message, "It's a coin flip really... :\\ "); }
    		if (answer == 9) { bot.reply(message, "Today, it's a yes. Tommorow, it will be a no."); }
    		if (answer == 10) { bot.reply(message, "Maybe!" ); }
    		if (answer == 11) { bot.reply(message, "Leave it with me."); }
    		if (answer == 12) { bot.reply(message, "Ask the question to the nearest mirror three times, and the answer will appear."); }
    		if (answer == 13) { bot.reply(message, "Your answer has been posted and should arrive within the next 7 days."); }
    		if (answer == 14) { bot.reply(message, "Deal or no deal?"); }
    		if (answer == 15) { bot.reply(message, "Probably not, sorry bud."); }
    		if (answer == 16) { bot.reply(message, "An answer to that question will cost £5. Are you paying by cash or card?"); }
    		if (answer == 17) { bot.reply(message, "Ask again later."); }
    		if (answer == 18) { bot.reply(message, "Are you sure you'd like to know that answer? I don't think you are."); }
    		if (answer == 19) { bot.reply(message, "I doubt that."); }
    		if (answer == 20) { bot.reply(message, "Sure thing! I think..."); }
    		if (answer == 21) { bot.reply(message, "Yes, the outlook is good."); }
    		if (answer == 22) { bot.reply(message, "I forgot the question, please repeat it."); }
    		if (answer == 23) { bot.reply(message, "I don't see why not."); }
    		if (answer == 24) { bot.reply(message, "Why would you ask that?"); }
      }
    }

    // Roulette
    if (params[0] == "-roulette") {
      if (data.settings.roulette.enabled === true) {
        var roulette = Math.floor(Math.random() * data.settings.roulette.chance) + 1;
        if (roulette == 1) {
          bot.deleteMessage(message);
          bot.reply(message, "BANG! You've been shot :(");
        }
        else {
          bot.reply(message, "Silence. You live to tell your story.");
        }
      }
    }

    // love
    if (params[0] == "-love") {
      if (data.settings.commands.love === true) {
        var love = Math.floor(Math.random() * 100) + 0;
    		bot.reply(message, "There is " + love + "% love between " + params[1] + " and " + author + " <3");
      }
    }
  });
});
