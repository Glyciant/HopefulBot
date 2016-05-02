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

app.get('/logs/:server/', function(req, res) {
  db.logs.getEntries(req.param.server).then(function(data) {
    res.render("logs", {title: "Home", logs: data})
  })
});

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
              banned_words: []
            },
            commands: {
              magic: 800,
              love: 800,
              roulette: 800,
              uptime: 800,
              get: 800,
              emote: 800,
              opemote: 500,
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
            quotes: {
              level: 800,
              quotes: []
            },
            shoutout: {
              level: 800,
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
              roulette: true,
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
})
