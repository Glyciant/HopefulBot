var config = require("./config"),
    db = require("./db"),
    helpers = require("./helpers"),
    schema = require("./schema"),
    express = require("express"),
    session = require("express-session")
    app = express(),
    discord = require("discord.js"),
    tmi = require("tmi.js")
    swig = require("swig"),
    restler = require("restler"),
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

app.get('*', function(req, res, next) {
	next();
});

app.get('/', function(req, res) {
  res.render("index", {title: "Home"})
});

app.get('/api/v1/twitch/:user/', function(req, res) {
  db.twitch_settings.get(req.param.user).then(function(data) {
    res.send(data[0])
  })
})

app.get('/api/v1/twitch/:user/logs/', function(req, res) {
  db.twitch_logs.getAll(req.param.user).then(function(data) {
    res.send(data)
  })
})

app.get('/api/v1/discord/:id/', function(req, res) {
  db.discord_settings.get(req.param.id).then(function(data) {
    res.send(data[0])
  })
})

app.get('/api/v1/discord/:id/logs/', function(req, res) {
  db.discord_logs.getAll(req.param.id).then(function(data) {
    res.send(data)
  })
})

app.get('/api/*/', function(req, res) {
  res.send({error: 404, message: "API data not found."})
})

var channels = []
db.twitch_settings.getAll().then(function(data) {
  for (var i in data) {
    channels.push(data[i].id)
  }

  channels.splice(channels.length - 1)

  if (channels.indexOf("#heepsbot") < 0) {
    channels.push("#heepsbot")
  }

  if (channels.indexOf("#heep123") < 0) {
    channels.push("#heep123")
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
    db.twitch_logs.addEntry({"display_name": display_name, date: date, content: message})

    // Join Channel
    if (params[0] == ";join") {
      if (channel == "#heep123" || channel == "#heepsbot") {
        if ((user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) == true) && params[1]) {
          client.join("#" + params[1])
          client.say("#" + params[1], "Hi! I have been sent to this channel by " + display_name + " in " + channel + ". If you don't want me here, type '~leave'. Otherwise, type '~setup' get started.")
          client.say(channel, display_name + " -> Joining channel #" + params[1] + "...")
        }
        else {
          client.join("#" + user.username)
          client.say("#" + user.username, "Hi! I have been sent to this channel by " + display_name + " in " + channel + ". If you don't want me here, type '~leave'. Otherwise, type '~setup' get started.")
          client.say(channel, display_name + " -> Joining channel #" + user.username + "...")
        }
      }
    }

    // Leave Channel
    if (params[0] == ";leave") {
      if (user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) == true || channel.replace("#","") == user.username) {
        client.say(channel, display_name + " -> Leaving channel...")
        client.leave(channel)
      }
    }

    // Setup
    if (params[0] == ";setup") {
      if (user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) == true || channel.replace("#","") == user.username) {
        db.twitch_settings.add({
          id: channel,
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
        })
        client.say(channel, display_name + " -> Setup completed.")
      }
    }

    // Handle Discord
    if (params[0] == ";discord") {
      if (user["user-type"] == "global_mod" || user["user-type"] == "admin" || user["user-type"] == "staff" || helpers.isAdmin(display_name) == true || channel.replace("#","") == user.username) {
        if (params[1] == "getbot") {
          client.say(channel, display_name + " -> Get the Heepsbot for Discord here: https://discordapp.com/oauth2/authorize?&client_id=176399298655682571&scope=bot&permissions=257054")
        }
        else if (params[1] == "server") {
          if (params[2]) {
            db.twitch_settings.get(channel).then(function(data) {
              data[0].discord = params[2]
              db.twitch_settings.update(channel, data[0])
            })
            client.say(channel, display_name + " -> Discord server has been set.")
          }
          else {
            client.say(channel, display_name + " -> Please include a server ID in your message.")
          }
        }
      }
    }
    db.twitch_settings.get(channel).then(function(data) {
      var data = data[0]

      // 8Ball
      if (params[0] == ";8ball") {
        if (helpers.userLevel(user, data) <= data.settings.commands.magic) {
          var answer = Math.floor(Math.random() * 24) + 1
          if (answer == 1) { client.say(channel, display_name + " -> Yes!")}
          if (answer == 2) { client.say(channel, display_name + " -> No!")}
          if (answer == 3) { client.say(channel, display_name + " -> Huh? I... wasn't listening. :P")}
          if (answer == 4) { client.say(channel, display_name + " -> I could answer that, but I'd have to ban you forever.")}
          if (answer == 5) { client.say(channel, display_name + " -> The answer is unclear. Trust me, I double checked.")}
          if (answer == 6) { client.say(channel, display_name + " -> YesNoYesNoYesNoYesNoYesNoYesNoYesNo :P")}
          if (answer == 7) { client.say(channel, display_name + " -> So, you do think I'm clever?") }
          if (answer == 8) { client.say(channel, display_name + " -> It's a coin flip really... :\\ ")}
          if (answer == 9) { client.say(channel, display_name + " -> Today, it's a yes. Tommorow, it will be a no.")}
          if (answer == 10) { client.say(channel, display_name + " -> Maybe!")}
          if (answer == 11) { client.say(channel, display_name + " -> Leave it with me.") }
          if (answer == 12) { client.say(channel, display_name + " -> Ask the question to the nearest mirror three times, and the answer will appear.") }
          if (answer == 13) { client.say(channel, display_name + " -> Your answer has been posted and should arrive within the next 7 days.") }
          if (answer == 14) { client.say(channel, display_name + " -> Deal or no deal?") }
          if (answer == 15) { client.say(channel, display_name + " -> Probably not, sorry bud.") }
          if (answer == 16) { client.say(channel, display_name + " -> An answer to that question will cost £5. Are you paying by cash or card?") }
          if (answer == 17) { client.say(channel, display_name + " -> Ask again later.") }
          if (answer == 18) { client.say(channel, display_name + " -> Are you sure you'd like to know that answer? I don't think you are.") }
          if (answer == 19) { client.say(channel, display_name + " -> I doubt that.") }
          if (answer == 20) { client.say(channel, display_name + " -> Sure thing! I think...") }
          if (answer == 21) { client.say(channel, display_name + " -> Yes, the outlook is good.") }
          if (answer == 22) { client.say(channel, display_name + " -> I forgot the question, please repeat it.") }
          if (answer == 23) { client.say(channel, display_name + " -> I don't see why not.") }
          if (answer == 24) { client.say(channel, display_name + " -> Why would you ask that?") }
        }
      }

      // Roulette
      if (params[0] == ";roulette") {
        if (helpers.userLevel(user, data) <= data.settings.roulette.level) {
          var roulette = Math.floor(Math.random() * data.settings.roulette.chance) + 1
          if (roulette == 1) {
            if (helpers.userLevel(user, data) <= 500) {
              client.say(channel, display_name + " -> BANG! You've been shot - but you're saved by your mod armour.");
            }
            else {
              client.timeout(channel, user.username, data.settings.roulette.timeout)
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
          var love = Math.floor(Math.random() * 100) + 0
          client.say(channel, "There is " + love + "% love between " + params[1] + " and " + display_name + " <3")
        }
      }

      // Shoutout
      if (params[0] == ";shoutout") {
        if (params[1] == "edit") {
          if (helpers.userLevel(user, data) <= data.settings.shoutout.addlevel) {
            if (params[2]) {
              data.settings.shoutout.channel = params[2]
              db.twitch_settings.update(channel, data)
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
              data.regulars.push(params[2].toLowerCase())
              db.twitch_settings.update(channel, data)
              client.say(channel, display_name + " -> " + params[2] + " has been added as a regular.");
            }
            else {
              client.say(channel, display_name + " -> Please include a user to add as a regular.");
            }
          }
          else if (params[1] == "remove") {
            if (params[2]) {
              data.regulars.splice(data.regulars.indexOf(params[2]))
              db.twitch_settings.update(channel, data)
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
              data.editors.push(params[2].toLowerCase())
              db.twitch_settings.update(channel, data)
              client.say(channel, display_name + " -> " + params[2] + " has been added as a editor.");
            }
            else {
              client.say(channel, display_name + " -> Please include a user to add as a editor.");
            }
          }
          else if (params[1] == "remove") {
            if (params[2]) {
              data.editors.splice(data.editors.indexOf(params[2]))
              db.twitch_settings.update(channel, data)
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
    })
  });
})

bot.loginWithToken(config.bot.discord).then(success).catch(err);
function success(token){ console.log("Login Successful!") }
function err(error){ console.log("Login Failed! Arguments: " + arguments) }

bot.on("message", function(message) {
  var author_id = message.author.id,
      channel_id = message.channel.id,
      server_id = message.channel.server.id,
      author = message.author.username,
      channel = message.channel.name,
      server = message.channel.server.name
      content = message.content,
      params = content.split(' '),
      message_id = message.id,
      date = new Date()

  // Logging
  db.discord_logs.addEntry({id: message_id, author_id: author_id, author: author, channel: channel, server_id: server_id, content: content, date: date})

  // Get Server ID
  if (params[0] == "-serverid") {
    bot.reply(message, "This server's ID is: " + server_id)
  }

  // Setup
  if (params[0] == "-setup") {
    bot.createChannel(server_id, "bot_log", "text", function(err, logchan) {
      bot.createRole(server_id, {
        name: "HeepsBot Admin",
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
          admin_role: role.id,
          log_channel: logchan.id,
          name: server,
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
        })
        bot.reply(message, "Setup Complete")
      })
    })
  }

  // Handle Twitch
  if (params[0] == "-twitch") {
    if (params[1] == "channel") {
      if (params[2]) {
        db.twitch_settings.getLink(server_id).then(function(link) {
          if (link !== [] && link[0].id == "#" + params[2]) {
            db.discord_settings.get(server_id).then(function(data) {
              data[0].twitch = "#" + params[2]
              db.discord_settings.update(server_id, data[0])
            })
            bot.reply(message, "Twitch channel has been set.")
          }
          else {
            bot.reply(message, "Could not set channel; the channel named has not set this server as theirs.")
          }
        })
      }
      else {
        bot.reply(message, "Please include a Twitch username in your message.")
      }
    }
  }

  db.discord_settings.get(server_id).then(function(data) {
    var data = data[0]

    // 8Ball
    if (params[0] == "-8ball") {
      if (data.settings.commands.magic == true) {
        var answer = Math.floor(Math.random() * 24) + 1
    		if (answer == 1) { bot.reply(message, "Yes!")}
    		if (answer == 2) { bot.reply(message, "No!")}
    		if (answer == 3) { bot.reply(message, "Huh? I... wasn't listening. :P")}
    		if (answer == 4) { bot.reply(message, "I could answer that, but I'd have to ban you forever.")}
    		if (answer == 5) { bot.reply(message, "The answer is unclear. Trust me, I double checked.")}
    		if (answer == 6) { bot.reply(message, "YesNoYesNoYesNoYesNoYesNoYesNoYesNo :P")}
    		if (answer == 7) { bot.reply(message, "So, you do think I'm clever?") }
    		if (answer == 8) { bot.reply(message, "It's a coin flip really... :\\ ")}
    		if (answer == 9) { bot.reply(message, "Today, it's a yes. Tommorow, it will be a no.")}
    		if (answer == 10) { bot.reply(message, "Maybe!")}
    		if (answer == 11) { bot.reply(message, "Leave it with me.") }
    		if (answer == 12) { bot.reply(message, "Ask the question to the nearest mirror three times, and the answer will appear.") }
    		if (answer == 13) { bot.reply(message, "Your answer has been posted and should arrive within the next 7 days.") }
    		if (answer == 14) { bot.reply(message, "Deal or no deal?") }
    		if (answer == 15) { bot.reply(message, "Probably not, sorry bud.") }
    		if (answer == 16) { bot.reply(message, "An answer to that question will cost £5. Are you paying by cash or card?") }
    		if (answer == 17) { bot.reply(message, "Ask again later.") }
    		if (answer == 18) { bot.reply(message, "Are you sure you'd like to know that answer? I don't think you are.") }
    		if (answer == 19) { bot.reply(message, "I doubt that.") }
    		if (answer == 20) { bot.reply(message, "Sure thing! I think...") }
    		if (answer == 21) { bot.reply(message, "Yes, the outlook is good.") }
    		if (answer == 22) { bot.reply(message, "I forgot the question, please repeat it.") }
    		if (answer == 23) { bot.reply(message, "I don't see why not.") }
    		if (answer == 24) { bot.reply(message, "Why would you ask that?") }
      }
    }

    // Roulette
    if (params[0] == "-roulette") {
      if (data.settings.roulette.enabled == true) {
        var roulette = Math.floor(Math.random() * data.settings.roulette.chance) + 1
        if (roulette == 1) {
          bot.deleteMessage(message)
          bot.reply(message, "BANG! You've been shot :(");
        }
        else {
          bot.reply(message, "Silence. You live to tell your story.");
        }
      }
    }

    // love
    if (params[0] == "-love") {
      if (data.settings.commands.love == true) {
        var love = Math.floor(Math.random() * 100) + 0
    		bot.reply(message, "There is " + love + "% love between " + params[1] + " and " + author + " <3")
      }
    }
  })
})
