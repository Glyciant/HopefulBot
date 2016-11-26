var express = require('express'),
  	config = require('./config'),
	  helpers = require('./helpers'),
    db = require('./db'),
  	bodyParser = require('body-parser'),
  	app = express(),
  	session = require('express-session'),
  	cookieParser = require('cookie-parser'),
	  swig = require('swig'),
    needle = require('needle'),
    Base64 = require('base-64'),
    twitchCommands = require('./commands_twitch'),
    discordCommands = require('./commands_discord'),
    beamCommands = require('./commands_beam');

// Set up views, routes, etc.
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/views/static'));
app.use(cookieParser());
app.use(session({secret: 'anything', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view cache', false);
swig.setDefaults({cache: false});

// Listen on Port
app.listen(config.app.port, function() {
  console.log('[DASHBOARD] Listing on port: ' + config.app.port);
});

// Run Code for All Pages
app.use(function(req, res, next) {
  res.locals.loggedin = req.session.user_id;
  res.locals.display_name = req.session.display_name;
  res.locals.twitch_authurl = config.twitch.auth.authurl;
  res.locals.discord_authurl = config.discord.auth.authurl;
  res.locals.discord_connecturl = config.discord.connect.authurl;
  res.locals.beam_authurl = config.beam.auth.authurl;
  if (res.locals.loggedin) {
    db.users.get(res.locals.loggedin).then(function(data) {
      res.locals.twitch_display_name = data.twitch_name;
      res.locals.twitch_id = data.twitc_hid;
      res.locals.discord_display_name = data.discord_name;
      res.locals.discord_id = data.discord_id;
      res.locals.beam_display_name = data.beam_name;
      res.locals.beam_id = data.beam_id;
      next();
    });
  }
  else {
    next();
  }
});

// Display Index
app.get('/', function(req, res) {
  res.render('index', { title: "Welcome!", theme: "Neutral" });
});

// Redirect docs root
app.get('/docs/', function(req, res) {
  res.redirect('/docs/web/');
});

// Get web docs root
app.get('/docs/web/', function(req, res) {
  res.render('docs_web', { title: "Web Panel Documentation", theme: "Neutral" });
});

// Get chat docs
app.get('/docs/chat/', function(req, res) {
  res.render('docs_chat', { title: "Web Panel Documentation", theme: "Neutral" });
});

// Get user levels docs
app.get('/docs/userlevels/', function(req, res) {
  res.render('docs_userlevels', { title: "User Levels Documentation" });
});

// Get variables docs
app.get('/docs/variables/', function(req, res) {
  res.render('docs_variables', { title: "Web Panel Documentation", theme: "Neutral" });
});

// Get API docs
app.get('/docs/api/', function(req, res) {
  res.render('docs_api', { title: "Web Panel Documentation", theme: "Neutral" });
});

// Get settings root
app.get('/settings/', function(req, res) {
  if (res.locals.loggedin) {
    res.redirect('/settings/' + res.locals.loggedin + '/');
  }
  else {
    res.redirect('/');
  }
});

// Get settings first page
app.get('/settings/:id/', function(req, res) {
  db.users.get(req.params.id).then(function(user) {
    user._id = user._id.toString();
    Promise.all([helpers.twitch_settings.getChannelById(user.twitch_id), helpers.beam_settings.getChannel(user.beam_name)]).then(function(data) {
      res.render('settings', {
        title: "Settings",
        theme: "Neutral",
        user: user,
        twitch: data[0],
        beam: data[1]
      });
    });
  }, function() {
    res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "You cannot access that page because the user ID provided does not exist."});
  });
});

// Get Twitch settings page
app.get('/settings/:id/twitch/', function(req, res) {
  db.users.get(req.params.id).then(function(user) {
    if (user && user.twitch_name !== null) {
      helpers.twitch_settings.getChannelById(user.twitch_id).then(function(api) {
        db.twitch_settings.getByUserId(req.params.id).then(function(data) {
          if (res.locals.loggedin == req.params.id) {
            var isOwner = true;
          }
          for (var i in data.editors) {
            if (data.editors[i].id == res.locals.twitch_id) {
              var isEditor = true;
            }
          }
          res.render('settings_twitch', {
            title: "Twitch Settings",
            theme: "Twitch",
            data: data,
            api: api,
            user: user,
            isOwner: isOwner,
            isEditor: isEditor
          });
        });
      });
    }
    else {
      res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "You cannot access that page because the user ID provided does not have a linked Twitch account."});
    }
  }, function() {
    res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "You cannot access that page because the user ID provided does not exist."});
  });
});

// Get Discord settings page
app.get('/settings/:id/discord/', function(req, res) {
  res.render('settings_discord', { title: "Discord Settings", theme: "Discord"});
});

// Get Beam settings page
app.get('/settings/:id/beam/', function(req, res) {
  res.render('settings_beam', { title: "Beam Settings", theme: "Beam"});
});

// Get settings root
app.get('/logs/', function(req, res) {
  if (res.locals.loggedin) {
    res.redirect('/logs/' + res.locals.loggedin + '/');
  }
  else {
    res.redirect('/');
  }
});

// Get logs first page
app.get('/logs/:id/', function(req, res) {
  res.render('logs_redirect', { title: "Logs", theme: "Neutral"});
});

// Get chat logs
app.get('/logs/:id/:platform/', function(req, res) {
  db.users.get(req.params.id).then(function(user) {
    if (req.params.platform == "twitch") {
      db.twitch_settings.getByUserId(user._id).then(function(twitch) {
        db.twitch_logs.getChannel("#" + twitch.username).then(function(data) {
          res.render('logs', { title: "Twitch Chat Logs", theme: "Twitch", type:"chat", logs: data });
        });
      });
    }
    else if (req.params.platform == "discord") {
      res.render('logs', { title: "Discord Chat Logs", theme: "Discord"});
    }
    else if (req.params.platform == "beam") {
      res.render('logs', { title: "Beam Chat Logs", theme: "Beam"});
    }
    else {
      res.redirect('/logs/' + req.params.id);
    }
  });
});

// Get action logs
app.get('/logs/:id/:platform/actions/', function(req, res) {
  if (req.params.platform == "twitch") {
    res.render('logs', { title: "Twitch Action Logs", theme: "Twitch"});
  }
  else if (req.params.platform == "discord") {
    res.render('logs', { title: "Discord Action Logs", theme: "Discord"});
  }
  else if (req.params.platform == "beam") {
    res.render('logs', { title: "Beam Action Logs", theme: "Beam"});
  }
  else {
    res.redirect('/logs/' + req.params.id);
  }
});

// Get popout Twitch poll
app.get('/popout/twitch/poll/', function(req, res) {
  res.render('poll', { title: "Twitch Poll" });
});

// Get popout Twitch raffle
app.get('/popout/twitch/raffle/', function(req, res) {
  res.render('raffle', { title: "Twitch Raffle" });
});

// Get popout Beam poll
app.get('/popout/beam/poll/', function(req, res) {
  res.render('poll', { title: "Beam Poll" });
});

// Signup Page
app.get('/signup/', function(req, res) {
  if (!res.locals.loggedin) {
    res.render('signup', { title: "Log In or Sign Up", theme: "Neutral" });
  }
  else {
    res.redirect("/link/");
  }
});

// Link Account Page
app.get('/link/', function(req, res) {
  if (res.locals.loggedin) {
    res.render('link', { title: "Link Account", theme: "Neutral" });
  }
  else {
    res.redirect("/signup/");
  }
});

// Admin Root Page
app.get('/admin/', function(req, res) {
  res.render('admin', { title: "Admin Tools", theme: "Neutral" });
});

// API Get User
app.get('/api/users/:id/', function(req, res) {
  db.users.get(req.params.id).then(function(data) {
    if (data) {
      res.send({
        "status": 200,
        "id": data._id.toString(),
        "twitch": {
          "id": data.twitch_id,
          "username": data.twitch_name
        },
        "discord": {
          "id": data.discord_id,
          "username": data.discord_name,
          "server": data.discord_server
        },
        "beam": {
          "id": data.beam_id,
          "username": data.beam_name
        }
      });
    }
    else {
      res.send({
        "error": "Not Found",
        "status": 404,
        "message": "The user with ID " + req.params.id + " does not exist."
      });
    }
  });
});

// API Get Custom Commands
app.get('/api/users/:id/commands', function(req, res) {
  db.users.get(req.params.id).then(function(data) {
    if (data) {
      res.send({
        "status": 200,
        "id": data._id.toString(),
        "commands": data.commands
      });
    }
    else {
      res.send({
        "error": "Not Found",
        "status": 404,
        "message": "The user with ID " + req.params.id + " does not exist."
      });
    }
  });
});

// API Get Custom Aliases
app.get('/api/users/:id/aliases', function(req, res) {
  db.users.get(req.params.id).then(function(data) {
    if (data) {
      res.send({
        "status": 200,
        "id": data._id.toString(),
        "aliases": data.aliases
      });
    }
    else {
      res.send({
        "error": "Not Found",
        "status": 404,
        "message": "The user with ID " + req.params.id + " does not exist."
      });
    }
  });
});

// API Twitch Settings
app.get('/api/settings/twitch/:id/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.params.id).then(function(data) {
    if (data) {
      data.status = 200;
      delete data._id;
      res.send(data);
    }
    else {
      res.send({
        "error": "Not Found",
        "status": 404,
        "message": "The user with ID " + req.params.id + " does not exist."
      });
    }
  });
});

// API Discord Settings
app.get('/api/settings/discord/:id/', function(req, res) {
  db.discord_settings.getByServerId(req.params.id).then(function(data) {
    if (data) {
      data.status = 200;
      delete data._id;
      res.send(data);
    }
    else {
      res.send({
        "error": "Not Found",
        "status": 404,
        "message": "The server with ID " + req.params.id + " does not exist."
      });
    }
  });
});

// API Beam Settings
app.get('/api/settings/beam/:id/', function(req, res) {
  db.beam_settings.getByBeamId(req.params.id).then(function(data) {
    if (data) {
      data.status = 200;
      delete data._id;
      res.send(data);
    }
    else {
      res.send({
        "error": "Not Found",
        "status": 404,
        "message": "The user with ID " + req.params.id + " does not exist."
      });
    }
  });
});

// API 404 Page
app.get('/api/*', function(req, res) {
  res.send({
    "error": "Not Found",
    "status": 404,
    "message": "That endpoint does not exist."
  });
});

// Twitch Auth
app.get('/auth/login/twitch/', function(req, res) {
  needle.post('https://api.twitch.tv/kraken/oauth2/token', {
    client_id: config.twitch.auth.cid,
    client_secret: config.twitch.auth.secret,
    grant_type: 'authorization_code',
    redirect_uri: config.twitch.auth.redirect,
    code: req.query.code
  }, function(err, resp, body) {
    if(!err) {
      needle.get('https://api.twitch.tv/kraken/user?oauth_token=' + body.access_token + "&client_id=" + config.twitch.auth.cid, { headers: { "Accept": "application/vnd.twitchtv.v5+json" } }, function(error, data) {
        if(!error) {
          if (req.session.user_id) {
            db.users.updateTwitch(req.session.user_id, data.body.name, data.body._id).then(function(result) {
              db.twitch_settings.getByUserId(req.session.user_id).then(function(result) {
                if (!result) {
                  db.twitch_settings.defaultSettings(req.session.user_id, data.body._id, data.body.name, data.body.display_name, data.body.logo).then(function(result) {
                    res.redirect('/settings/');
                  });
                }
                else {
                  res.redirect('/settings/');
                }
              });
            });
          }
          else {
            req.session.twitch_auth = body.access_token;
            req.session.twitch_id = data.body._id;
            req.session.twitch_display_name = data.body.display_name;
            req.session.display_name = data.body.display_name;
            db.users.getUserIdByTwitchId(req.session.twitch_id).then(function(result) {
              if (!result) {
                db.users.generateUser(req.session.twitch_id, req.session.twitch_display_name, null, null, null, null).then(function(result) {
                  db.users.getUserIdByTwitchId(req.session.twitch_id).then(function(result) {
                    req.session.user_id = result;
                    db.twitch_settings.getByUserId(req.session.user_id).then(function(result) {
                      if (!result) {
                        db.twitch_settings.defaultSettings(req.session.user_id, data.body._id, data.body.name, data.body.display_name, data.body.logo).then(function(result) {
                          res.redirect('/settings/');
                        });
                      }
                      else {
                        res.redirect('/settings/');
                      }
                    });
                  });
                });
              }
              else {
                db.users.getUserIdByTwitchId(req.session.twitch_id).then(function(result) {
                  req.session.user_id = result;
                  res.redirect('/settings/');
                });
              }
            });
          }
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


// Discord Auth
app.get('/auth/login/discord/', function(req, res) {
  needle.post('https://discordapp.com/api/oauth2/token', {
    client_id: config.discord.auth.cid,
    client_secret: config.discord.auth.secret,
    grant_type: 'authorization_code',
    redirect_uri: config.discord.auth.redirect,
    code: req.query.code
  }, function(err, resp, body) {
    if(!err) {
      needle.get('https://discordapp.com/api/users/@me', {
        headers: {
          'Authorization': "Bearer " + body.access_token
        }
      }, function(error, data) {
        if(!error) {
          if (req.session.user_id) {
            db.users.updateDiscordUser(req.session.user_id, data.body.id, data.body.username).then(function(result) {
              res.redirect(res.locals.discord_connecturl);
            });
          }
          else {
            req.session.discord_auth = body.access_token;
            req.session.discord_id = data.body.id;
            req.session.discord_display_name = data.body.username;
            req.session.display_name = data.body.username;
            db.users.getUserIdByDiscordId(req.session.discord_id).then(function(result) {
              if (!result) {
                db.users.generateUser(null, null, req.session.discord_id, req.session.discord_display_name, null, null).then(function(result) {
                  db.users.getUserIdByDiscordId(req.session.discord_id).then(function(result) {
                    req.session.user_id = result;
                    res.redirect(res.locals.discord_connecturl);
                  });
                });
              }
              else {
                db.users.getUserIdByDiscordId(req.session.discord_id).then(function(result) {
                  req.session.user_id = result;
                  res.redirect('/settings/');
                });
              }
            });
          }
        }
        else{
          res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Could not authenticate via the Discord API."});
        }
      });
    }
    else{
      res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Discord API appears to be having issues."});
    }
  });
});

// Discord Bot Connectopn
app.get('/auth/connect/discord/', function(req, res) {
  needle.post('https://discordapp.com/api/oauth2/token', {
    client_id: config.discord.connect.cid,
    client_secret: config.discord.connect.secret,
    grant_type: 'authorization_code',
    redirect_uri: config.discord.connect.redirect,
    code: req.query.code
  }, function(err, resp, body) {
    if(!err) {
      needle.get('https://discordapp.com/api/users/@me', {
        headers: {
          'Authorization': "Bearer " + body.access_token
        }
      }, function(error, data) {
        if(!error) {
          needle.get('https://discordapp.com/api/users/@me/guilds', {
            headers: {
              'Authorization': "Bearer " + body.access_token
            }
          }, function(error, user_servers) {
            if (req.session.user_id) {
              Promise.all([discordCommands.botServers(), db.discord_settings.getAll()]).then(servers => {
                for (var i in user_servers.body) {
                  var user_server_id = user_servers.body[i].id;
                  for (var j in servers[0]) {
                    var bot_server_id = servers[0][j].id;
                    if (bot_server_id == user_server_id) {
                      var wasFound = false;
                      for (var k in servers[1]) {
                        if (servers[1][k]) {
                          var data_server_id = servers[1][k].server_id;
                          if (bot_server_id == data_server_id) {
                            var wasFound = true;
                          }
                        }
                      }
                      if (wasFound === false) {
                        db.discord_settings.defaultSettings(req.session.user_id, bot_server_id, servers[0][j].name, servers[0][j].icon).then(function(result) {
                          db.users.updateDiscordServer(req.session.user_id, bot_server_id).then(function(result) {
                            res.redirect('/settings/');
                          });
                        });
                      }
                    }
                  }
                }
              });
            }
            else {
              db.users.getUserIdByDiscordId(req.session.discord_id).then(function(result) {
                if (!result) {
                  db.users.getUserIdByDiscordId(req.session.discord_id).then(function(result) {
                    Promise.all([discordCommands.botServers(), db.discord_settings.getAll()]).then(servers => {
                      for (var i in user_servers.body) {
                        var user_server_id = user_servers.body[i].id;
                        for (var j in servers[0]) {
                          var bot_server_id = servers[0][j].id;
                          if (bot_server_id == user_server_id) {
                            var wasFound = false;
                            for (var k in servers[1]) {
                              if (servers[1][k]) {
                                var data_server_id = servers[1][k].server_id;
                                if (bot_server_id == data_server_id) {
                                  var wasFound = true;
                                }
                              }
                            }
                            if (wasFound === false) {
                              db.discord_settings.defaultSettings(req.session.user_id, bot_server_id, servers[0][j].name, servers[0][j].icon).then(function(result) {
                                db.users.updateDiscordServer(req.session.user_id, bot_server_id).then(function(result) {
                                  res.redirect('/settings/');
                                });
                              });
                            }
                          }
                        }
                      }
                    });
                  });
                }
              });
            }
          });
        }
        else{
          res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Could not authenticate via the Discord API."});
        }
      });
    }
    else{
      res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Discord API appears to be having issues."});
    }
  });
});

// Beam Auth
app.get('/auth/login/beam/', function(req, res) {
  needle.post('https://beam.pro/api/v1/oauth/token', {
    client_id: config.beam.auth.cid,
    client_secret: config.beam.auth.secret,
    grant_type: 'authorization_code',
    redirect_uri: config.beam.auth.redirect,
    code: req.query.code
  }, function(err, resp, body) {
    if(!err) {
      needle.get('https://beam.pro/api/v1/users/current', {
        headers: {
          'Authorization': "Bearer " + body.access_token
        }
      }, function(error, data) {
        if(!error) {
          if (req.session.user_id) {
            db.users.updateBeam(req.session.user_id, data.body.username, data.body.channel.id).then(function(result) {
              db.beam_settings.getByUserId(req.session.user_id).then(function(result) {
                if (!result) {
                  db.beam_settings.defaultSettings(req.session.user_id, data.body.channel.id, data.body.username, data.body.avatar).then(function(result) {
                    res.redirect('/settings/');
                  });
                }
                else {
                  res.redirect('/settings/');
                }
              });
            });
          }
          else {
            req.session.beam_auth = body.access_token;
            req.session.beam_id = data.body.channel.id;
            req.session.beam_display_name = data.body.username;
            req.session.display_name = data.body.username;
            db.users.getUserIdByBeamId(req.session.beam_id).then(function(result) {
              if (!result) {
                db.users.generateUser(null, null, null, null, req.session.beam_id, req.session.beam_display_name).then(function(result) {
                  db.users.getUserIdByBeamId(req.session.beam_id).then(function(result) {
                    req.session.user_id = result;
                    db.beam_settings.getByUserId(result).then(function(result) {
                      if (!result) {
                        db.beam_settings.defaultSettings(req.session.user_id, data.body.channel.id, data.body.username, data.body.avatar).then(function(result) {
                          res.redirect('/settings/');
                        });
                      }
                      else {
                        res.redirect('/settings/');
                      }
                    });
                  });
                });
              }
              else {
                db.users.getUserIdByBeamId(req.session.beam_id).then(function(result) {
                  req.session.user_id = result;
                  res.redirect('/settings/');
                });
              }
            });
          }
        }
        else{
          res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Could not authenticate via the Beam API."});
        }
      });
    }
    else{
      res.render("error", {title: "Error", theme: "Neutral", code: "404", description: "Beam API appears to be having issues."});
    }
  });
});

// Unlink Twitch Account
app.post('/unlink/twitch/', function(req, res) {
  db.users.get(req.body.id).then(function(data) {
    twitchCommands.partChannel(data.twitch_name);
    db.users.updateTwitch(req.body.id, null);
    db.twitch_settings.delete(req.body.id);
  });
  return;
});

// Unlink Discord Account
app.post('/unlink/discord/', function(req, res) {
  db.users.get(req.body.id).then(function(data) {
    var servers = discordCommands.botServers();
    for (var i in servers) {
      if (servers[i].id == data.discord_server) {
        discordCommands.leaveServer(servers[i]);
      }
    }
    db.users.updateDiscordUser(req.body.id, null, null);
    db.users.updateDiscordServer(req.body.id, null);
    db.discord_settings.delete(req.body.id);
  });
  return;
});

// Unlink Beam Account
app.post('/unlink/beam/', function(req, res) {
  db.users.updateBeam(req.body.id, null);
  db.beam_settings.delete(req.body.id);
  return;
});

// Join Bot to Twitch Channel
app.post('/twitch/channel/join/', function(req, res) {
  twitchCommands.joinChannel(req.body.channel);
});

// Part Bot to Twitch Channel
app.post('/twitch/channel/part/', function(req, res) {
  twitchCommands.partChannel(req.body.channel);
});

// Rejoin Bot to Twitch Channel
app.post('/twitch/channel/rejoin/', function(req, res) {
  twitchCommands.rejoinChannel(req.body.channel);
});

// Reset Twitch Settings
app.post('/twitch/channel/reset/', function(req, res) {
  twitchCommands.resetBot(req.body.channel);
});

// Permit User
app.post('/twitch/protection/permit/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    twitchCommands.permitUser("#" + req.body.channel, { "display-name": req.body.loggedin }, [data.command_prefix + "permit", req.body.user], data);
  });
});

// Add Editor
app.post('/twitch/editors/add/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    if (data.editors.map(function(x) { return x.user; }).indexOf(req.body.user) > -1) {
      res.send({ status: "exists" });
    }
    else {
      helpers.twitch_settings.getChannelByName(req.body.user).then(function(user) {
        data.editors.push({ user: req.body.user, username: req.body.user.toLowerCase(), icon: user.logo, id: user._id });
        db.twitch_settings.update(data.user_id, data);
        res.send({ status: "success", icon: user.logo, id: user._id });
      });
    }
  });
});

// Remove Editor
app.post('/twitch/editors/remove/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.editors.splice(data.editors.map(function(x) { return x.username; }).indexOf(req.body.user.toLowerCase()), 1);
    db.twitch_settings.update(data.user_id, data);
  });
});

// Add Regular
app.post('/twitch/regulars/add/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    if (data.regulars.map(function(x) { return x.user; }).indexOf(req.body.user) > -1) {
      res.send({ status: "exists" });
    }
    else {
      helpers.twitch_settings.getChannelByName(req.body.user).then(function(user) {
        data.regulars.push({ user: req.body.user, username: req.body.user.toLowerCase(), icon: user.logo, id: user._id });
        db.twitch_settings.update(data.user_id, data);
        res.send({ status: "success", icon: user.logo, id: user._id });
      });
    }
  });
});

// Remove Regular
app.post('/twitch/regulars/remove/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.regulars.splice(data.regulars.map(function(x) { return x.username; }).indexOf(req.body.user.toLowerCase()), 1);
    db.twitch_settings.update(data.user_id, data);
  });
});

// Add Restricted Users
app.post('/twitch/restricted_users/add/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    if (data.restricted.map(function(x) { return x.user; }).indexOf(req.body.user) > -1) {
      res.send({ status: "exists" });
    }
    else {
      helpers.twitch_settings.getChannelByName(req.body.user).then(function(user) {
        data.restricted.push({ user: req.body.user, username: req.body.user.toLowerCase(), icon: user.logo, id: user._id });
        db.twitch_settings.update(data.user_id, data);
        res.send({ status: "success", icon: user.logo, id: user._id });
      });
    }
  });
});

// Remove Restricted Users
app.post('/twitch/restricted_users/remove/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.restricted.splice(data.restricted.map(function(x) { return x.username; }).indexOf(req.body.user.toLowerCase()), 1);
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Actions Protection
app.post('/twitch/protection/actions/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.actions.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Actions Protection Settings
app.post('/twitch/protection/actions/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.actions.warning = (req.body.warning === "true");
    data.spam.actions.post_message = (req.body.post_message === "true");
    data.spam.actions.whisper_message = (req.body.whisper_message === "true");
    data.spam.actions.warning_length = parseInt(req.body.warning_length);
    data.spam.actions.length = parseInt(req.body.length);
    data.spam.actions.message = req.body.message;
    data.spam.actions.level = parseInt(req.body.level);
    if (isNaN(data.spam.actions.warning_length)) {
      data.spam.actions.warning_length = 1;
    }
    if (isNaN(data.spam.actions.length)) {
      data.spam.actions.length = 600;
    }
    if (isNaN(data.spam.actions.level)) {
      data.spam.actions.level = 600;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Blacklist Protection
app.post('/twitch/protection/blacklist/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.blacklist.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Blacklist Protection Settings
app.post('/twitch/protection/blacklist/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.blacklist.blacklist = req.body.blacklist;
    data.spam.blacklist.warning = (req.body.warning === "true");
    data.spam.blacklist.post_message = (req.body.post_message === "true");
    data.spam.blacklist.whisper_message = (req.body.whisper_message === "true");
    data.spam.blacklist.warning_length = parseInt(req.body.warning_length);
    data.spam.blacklist.length = parseInt(req.body.length);
    data.spam.blacklist.message = req.body.message;
    data.spam.blacklist.level = parseInt(req.body.level);
    if (isNaN(data.spam.blacklist.warning_length)) {
      data.spam.blacklist.warning_length = 1;
    }
    if (isNaN(data.spam.blacklist.length)) {
      data.spam.blacklist.length = 600;
    }
    if (isNaN(data.spam.blacklist.level)) {
      data.spam.blacklist.level = 600;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Caps Protection
app.post('/twitch/protection/caps/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.caps.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Caps Protection Settings
app.post('/twitch/protection/caps/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.caps.minimum_length = parseInt(req.body.minimum_length);
    data.spam.caps.percentage = parseInt(req.body.percentage);
    data.spam.caps.warning = (req.body.warning === "true");
    data.spam.caps.post_message = (req.body.post_message === "true");
    data.spam.caps.whisper_message = (req.body.whisper_message === "true");
    data.spam.caps.warning_length = parseInt(req.body.warning_length);
    data.spam.caps.length = parseInt(req.body.length);
    data.spam.caps.message = req.body.message;
    data.spam.caps.level = parseInt(req.body.level);
    if (isNaN(data.spam.caps.warning_length)) {
      data.spam.caps.warning_length = 1;
    }
    if (isNaN(data.spam.caps.length)) {
      data.spam.caps.length = 600;
    }
    if (isNaN(data.spam.caps.level)) {
      data.spam.caps.level = 600;
    }
    if (isNaN(data.spam.caps.minimum_length)) {
      data.spam.caps.minimum_length = 8;
    }
    if (isNaN(data.spam.caps.percentage)) {
      data.spam.caps.percentage = 70;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Excess Emotes Protection
app.post('/twitch/protection/emotes/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.emotes.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Excess Emotes Protection Settings
app.post('/twitch/protection/emotes/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.emotes.limit = parseInt(req.body.limit);
    data.spam.emotes.warning = (req.body.warning === "true");
    data.spam.emotes.post_message = (req.body.post_message === "true");
    data.spam.emotes.whisper_message = (req.body.whisper_message === "true");
    data.spam.emotes.warning_length = parseInt(req.body.warning_length);
    data.spam.emotes.length = parseInt(req.body.length);
    data.spam.emotes.message = req.body.message;
    data.spam.emotes.level = parseInt(req.body.level);
    if (isNaN(data.spam.emotes.warning_length)) {
      data.spam.emotes.warning_length = 1;
    }
    if (isNaN(data.spam.emotes.length)) {
      data.spam.emotes.length = 600;
    }
    if (isNaN(data.spam.emotes.level)) {
      data.spam.emotes.level = 600;
    }
    if (isNaN(data.spam.emotes.limit)) {
      data.spam.emotes.limit = 5;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch IP Protection
app.post('/twitch/protection/ips/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.ips.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch IP Protection Settings
app.post('/twitch/protection/ips/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.ips.prevent_evasion = (req.body.prevent_evasion === "true");
    data.spam.ips.permit = (req.body.permit === "true");
    data.spam.ips.whitelist = req.body.whitelist;
    data.spam.ips.warning = (req.body.warning === "true");
    data.spam.ips.post_message = (req.body.post_message === "true");
    data.spam.ips.whisper_message = (req.body.whisper_message === "true");
    data.spam.ips.warning_length = parseInt(req.body.warning_length);
    data.spam.ips.length = parseInt(req.body.length);
    data.spam.ips.message = req.body.message;
    data.spam.ips.level = parseInt(req.body.level);
    if (isNaN(data.spam.ips.warning_length)) {
      data.spam.ips.warning_length = 1;
    }
    if (isNaN(data.spam.ips.length)) {
      data.spam.ips.length = 600;
    }
    if (isNaN(data.spam.ips.level)) {
      data.spam.ips.level = 600;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Link Protection
app.post('/twitch/protection/links/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.links.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Link Protection Settings
app.post('/twitch/protection/links/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.links.prevent_evasion = (req.body.prevent_evasion === "true");
    data.spam.links.permit = (req.body.permit === "true");
    data.spam.links.whitelist = req.body.whitelist;
    data.spam.links.warning = (req.body.warning === "true");
    data.spam.links.post_message = (req.body.post_message === "true");
    data.spam.links.whisper_message = (req.body.whisper_message === "true");
    data.spam.links.warning_length = parseInt(req.body.warning_length);
    data.spam.links.length = parseInt(req.body.length);
    data.spam.links.message = req.body.message;
    data.spam.links.level = parseInt(req.body.level);
    if (isNaN(data.spam.links.warning_length)) {
      data.spam.links.warning_length = 1;
    }
    if (isNaN(data.spam.links.length)) {
      data.spam.links.length = 600;
    }
    if (isNaN(data.spam.links.level)) {
      data.spam.links.level = 600;
    }
    if (isNaN(data.spam.emotes.limit)) {
      data.spam.emotes.limit = 350;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Lone Emotes Protection
app.post('/twitch/protection/lones/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.lones.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Lone Emotes Protection Settings
app.post('/twitch/protection/lones/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.lones.warning = (req.body.warning === "true");
    data.spam.lones.post_message = (req.body.post_message === "true");
    data.spam.lones.whisper_message = (req.body.whisper_message === "true");
    data.spam.lones.warning_length = parseInt(req.body.warning_length);
    data.spam.lones.length = parseInt(req.body.length);
    data.spam.lones.message = req.body.message;
    data.spam.lones.level = parseInt(req.body.level);
    if (isNaN(data.spam.lones.warning_length)) {
      data.spam.lones.warning_length = 1;
    }
    if (isNaN(data.spam.lones.length)) {
      data.spam.lones.length = 600;
    }
    if (isNaN(data.spam.lones.level)) {
      data.spam.lones.level = 600;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Paragraph Protection
app.post('/twitch/protection/paragraph/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.paragraph.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Paragraph Protection Settings
app.post('/twitch/protection/paragraph/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.paragraph.limit = parseInt(req.body.limit);
    data.spam.paragraph.warning = (req.body.warning === "true");
    data.spam.paragraph.post_message = (req.body.post_message === "true");
    data.spam.paragraph.whisper_message = (req.body.whisper_message === "true");
    data.spam.paragraph.warning_length = parseInt(req.body.warning_length);
    data.spam.paragraph.length = parseInt(req.body.length);
    data.spam.paragraph.message = req.body.message;
    data.spam.paragraph.level = parseInt(req.body.level);
    if (isNaN(data.spam.paragraph.warning_length)) {
      data.spam.paragraph.warning_length = 1;
    }
    if (isNaN(data.spam.paragraph.length)) {
      data.spam.paragraph.length = 600;
    }
    if (isNaN(data.spam.paragraph.level)) {
      data.spam.paragraph.level = 600;
    }
    if (isNaN(data.spam.paragraph.limit)) {
      data.spam.paragraph.level = 350;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Repitition Protection
app.post('/twitch/protection/repitition/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.repitition.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Repitition Protection Settings
app.post('/twitch/protection/repitition/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.repitition.warning = (req.body.warning === "true");
    data.spam.repitition.post_message = (req.body.post_message === "true");
    data.spam.repitition.whisper_message = (req.body.whisper_message === "true");
    data.spam.repitition.warning_length = parseInt(req.body.warning_length);
    data.spam.repitition.length = parseInt(req.body.length);
    data.spam.repitition.message = req.body.message;
    data.spam.repitition.level = parseInt(req.body.level);
    if (isNaN(data.spam.repitition.warning_length)) {
      data.spam.repitition.warning_length = 1;
    }
    if (isNaN(data.spam.repitition.length)) {
      data.spam.repitition.length = 600;
    }
    if (isNaN(data.spam.repitition.level)) {
      data.spam.repitition.level = 600;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Toggle Twitch Symbol Protection
app.post('/twitch/protection/symbols/toggle/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.symbols.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data.user_id, data);
  });
});

// Update Twitch Symbol Protection Settings
app.post('/twitch/protection/symbols/update/', function(req, res) {
  db.twitch_settings.getByTwitchId(req.body.channel).then(function(data) {
    data.spam.symbols.minimum_length = parseInt(req.body.minimum_length);
    data.spam.symbols.percentage = parseInt(req.body.percentage);
    data.spam.symbols.warning = (req.body.warning === "true");
    data.spam.symbols.post_message = (req.body.post_message === "true");
    data.spam.symbols.whisper_message = (req.body.whisper_message === "true");
    data.spam.symbols.warning_length = parseInt(req.body.warning_length);
    data.spam.symbols.length = parseInt(req.body.length);
    data.spam.symbols.message = req.body.message;
    data.spam.symbols.level = parseInt(req.body.level);
    if (isNaN(data.spam.symbols.warning_length)) {
      data.spam.symbols.warning_length = 1;
    }
    if (isNaN(data.spam.symbols.length)) {
      data.spam.symbols.length = 600;
    }
    if (isNaN(data.spam.symbols.level)) {
      data.spam.symbols.level = 600;
    }
    if (isNaN(data.spam.symbols.minimum_length)) {
      data.spam.symbols.minimum_length = 8;
    }
    if (isNaN(data.spam.symbols.percentage)) {
      data.spam.symbols.percentage = 70;
    }
    db.twitch_settings.update(data.user_id, data);
  });
});

// Sign out
app.get('/auth/logout/', function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

// Display 404 Error
app.get('*', function(req, res) {
  res.render('error', { title: "404", theme: "Neutral", code: "404",  description: "That page could not be found." });
});
