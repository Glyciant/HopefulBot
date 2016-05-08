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
  console.log('Listing on port: ' + config.app.port);
});

app.locals = {
  authurl: config.auth.authurl
};

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
  db.twitch_logs.getAll("#" + req.params.user).then(function(data) {
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
    var channels = [];
    for (var i in twitch) {
      if (i !== "remove") {
        if (twitch[i].editors.indexOf(app.locals.username) > -1 || twitch[i].id == "#" + app.locals.username) {
          channels.push({twitch: twitch[i].id.replace("#", ""), discord: twitch[i].discord});
        }
      }
    }
    res.render("dashboard", {title: "Dashboard", theme: "Neutral", data: channels});
  });
});

app.get('/dashboard/:user/api/', function(req, res) {
  res.render("api", {title: "Manage API Data", theme: "Neutral"});
});

app.get('/dashboard/:user/twitch/', function(req, res) {
  res.render("twitch", {title: "Twitch Dashboard", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/alerts/', function(req, res) {
  res.render("twitch_alerts", {title: "Twitch Chat Alerts", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/autowelcome/', function(req, res) {
  res.render("twitch_autowelcome", {title: "Twitch Auto-Welcome", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/commands/', function(req, res) {
  db.twitch_settings.get("#" + req.params.user).then(function(channel) {
    if (helpers.isEditor(app.locals.username, channel[0]) || helpers.isAdmin(app.locals.username) || req.params.user == app.locals.username) {
      var editor = true;
    }
    db.commands.getAll("#" + req.params.user).then(function(data) {
      res.render("twitch_commands", {title: "Custom Commands", theme: "Twitch", editor: editor, data: data, owner: req.params.user});
    });
  });
});

app.get('/dashboard/:user/twitch/highlights/', function(req, res) {
  res.render("twitch_highlights", {title: "Twitch Highlight Markers", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/levels/', function(req, res) {
  res.render("twitch_levels", {title: "Twitch Command User-Levels", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/logs/', function(req, res) {
  res.render("twitch_logs", {title: "Twitch Chat Logs", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/points/', function(req, res) {
  res.render("twitch_points", {title: "Twitch Points", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/points/autopoints/', function(req, res) {
  res.render("twitch_points_autopoints", {title: "Twitch Auto-Points", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/points/claim/', function(req, res) {
  res.render("twitch_points_claim", {title: "Twitch Points Claim", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/points/:user/', function(req, res) {
  res.render("twitch_points_user", {title: "Twitch Points: " + req.param.user, theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/poll/', function(req, res) {
  res.render("twitch_poll", {title: "Twitch Poll", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/poll/overlay/', function(req, res) {
  res.render("twitch_poll_overlay", {title: "Twitch Poll Stream Overlay", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/raffle/', function(req, res) {
  res.render("twitch_raffle", {title: "Twitch Raffle", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/raffle/overlay/', function(req, res) {
  res.render("twitch_raffle_overlay", {title: "Twitch Raffle Stream Overlay", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/shoutout/', function(req, res) {
  res.render("twitch_shoutout", {title: "Twitch Shoutout", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/spam/', function(req, res) {
  res.render("twitch_spam", {title: "Twitch Spam Protection", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/timers/', function(req, res) {
  res.render("twitch_timers", {title: "Twitch Timers", theme: "Twitch"});
});

app.get('/dashboard/:user/twitch/users/', function(req, res) {
  db.twitch_settings.get("#" + req.params.user).then(function(channel) {
    if (helpers.isEditor(app.locals.username, channel[0]) || helpers.isAdmin(app.locals.username) || req.params.user == app.locals.username) {
      var editor = true;
    }
    if (helpers.isAdmin(app.locals.username) || req.params.user == app.locals.username) {
      var admin = true;
    }
    db.twitch_settings.get("#" + app.locals.username).then(function(data) {
      res.render("twitch_users", {title: "Twitch Users", theme: "Twitch", editors: data[0].editors, regulars: data[0].regulars, editor: editor, admin: admin});
    });
  });
});

app.get('/dashboard/:server/discord/', function(req, res) {
  res.render("discord", {title: "Discord Dashboard", theme: "Discord"});
});

app.get('/dashboard/:server/discord/commands/', function(req, res) {
  res.render("discord_commands", {title: "Discord Commands", theme: "Discord"});
});

app.get('/dashboard/:server/discord/logs/', function(req, res) {
  res.render("discord_logs", {title: "Discord Chat Logs", theme: "Discord"});
});

app.get('/dashboard/:server/discord/poll/', function(req, res) {
  res.render("discord_poll", {title: "Discord Poll", theme: "Discord"});
});

app.get('/dashboard/:server/discord/poll/overlay/', function(req, res) {
  res.render("discord_poll_overlay", {title: "Discord Poll Stream Overlay", theme: "Discord"});
});

app.get('/dashboard/:server/discord/raffle/', function(req, res) {
  res.render("discord_raffle", {title: "Discord Raffle", theme: "Discord"});
});

app.get('/dashboard/:server/discord/raffle/overlay/', function(req, res) {
  res.render("discord_raffle_overlay", {title: "Discord Raffle Stream Overlay", theme: "Discord"});
});

app.get('/dashboard/:server/discord/spam/', function(req, res) {
  res.render("discord_spam", {title: "Discord Spam", theme: "Discord"});
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
  req.body.level = parseInt(req.body.level)
  req.body.cost = parseInt(req.body.cost)
  req.body.add = parseInt(req.body.add)
  req.body.cooldown = parseInt(req.body.cooldown)
  req.body.count = 0

  db.commands.add(req.body)
});

app.post('/twitch/commands/edit', function(req, res) {
  req.body.level = parseInt(req.body.level)
  req.body.cost = parseInt(req.body.cost)
  req.body.add = parseInt(req.body.add)
  req.body.cooldown = parseInt(req.body.cooldown)
  req.body.count = 0

  db.commands.update(req.body)
});

app.post('/twitch/commands/delete', function(req, res) {
  db.commands.delete(req.body.id)
});

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

  client.on("chat", function (channel, user, message, self) {
    var display_name = user["display-name"],
        date = new Date(),
        params = message.split(' ');

    // Logging
    db.twitch_logs.addEntry({"display_name": display_name, date: date, content: message});

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
            spam: {
              links: 1000,
              caps: 1000,
              symbols: 1000,
              blacklist: 1000,
              paragraph: 1000,
              actions: 1000,
              banned_words: [],
              banned_regex: []
            },
            commands: {
              magic: 800,
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
              enabled: false,
              message: "Thank you so much for subscribing, ^USER^! <3"
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
          client.say(channel, display_name + " -> Get the Heepsbot for Discord here: https://discordapp.com/oauth2/authorize?&client_id=176399298655682571&scope=bot&permissions=257054");
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
        if (helpers.userLevel(user, data) <= data.settings.commands.magic) {
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
          var command = command[0];
          client.say(channel, command.response);
          command.count = command.count + 1;
          db.commands.update(command);
        });
      });
    });
  });
});

bot.loginWithToken(config.bot.discord).then(success).catch(err);
function success(token){ console.log("Login Successful!"); }
function err(error){ console.log("Login Failed! Arguments: " + arguments); }

bot.on("message", function(message) {
  var author_id = message.author.id,
      channel_id = message.channel.id,
      server_id = message.channel.server.id,
      author = message.author.username,
      channel = message.channel.name,
      server = message.channel.server.name;
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
