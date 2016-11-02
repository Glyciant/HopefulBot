var express = require('express'),
  	config = require('./config'),
    db = require('./db'),
	  helpers = require('./helpers'),
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
  res.locals.username = req.session.name;
  res.locals.isAdmin = helpers.general.isAdmin(res.locals.loggedin);
  res.locals.twitch_authurl = config.twitch.auth.authurl;
  res.locals.discord_authurl = config.discord.auth.authurl;
  res.locals.beam_authurl = config.beam.auth.authurl;
  if (res.locals.loggedin) {
    db.users.get(res.locals.loggedin).then(function(result) {
      res.locals.twitch = result.twitch;
      res.locals.discord = result.discord_id;
      res.locals.beam = result.beam;
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
  res.render('docs', { title: "Web Panel Documentation", theme: "Neutral", redirect: "web" });
});

// Get Twitch web docs
app.get('/docs/web/twitch/', function(req, res) {
  res.render('docs_web_twitch', { title: "Twitch Web Panel Documentation", theme: "Twitch"});
});

// Get Discord web docs
app.get('/docs/web/discord/', function(req, res) {
  res.render('docs_web_discord', { title: "Discord Web Panel Documentation", theme: "Discord"});
});

// Get Beam web docs
app.get('/docs/web/beam/', function(req, res) {
  res.render('docs_web_beam', { title: "Beam Web Panel Documentation", theme: "Beam"});
});

// Get chat docs root
app.get('/docs/chat/', function(req, res) {
  res.render('docs', { title: "Web Panel Documentation", theme: "Neutral", redirect: "chat" });
});

// Get Twitch chat docs
app.get('/docs/chat/twitch/', function(req, res) {
  res.render('docs_chat_twitch', { title: "Twitch Chat Commands Documentation", theme: "Twitch"});
});

// Get Discord chat docs
app.get('/docs/chat/discord/', function(req, res) {
  res.render('docs_chat_discord', { title: "Discord Chat Commands Documentation", theme: "Discord"});
});

// Get Beam chat docs
app.get('/docs/chat/beam/', function(req, res) {
  res.render('docs_chat_beam', { title: "Beam Chat Commands Documentation", theme: "Beam"});
});

// Get user levels docs
app.get('/docs/userlevels/', function(req, res) {
  res.render('docs_userlevels', { title: "User Levels Documentation", theme: "Neutral"});
});

// Get variables docs
app.get('/docs/variables/', function(req, res) {
  res.render('docs_variables', { title: "Command Variables Documentation", theme: "Neutral"});
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
    res.render('settings', {
      title: "Settings",
      theme: "Neutral",
      user: user
    });
  });
});

// Get Twitch settings page
app.get('/settings/:id/twitch/', function(req, res) {
  db.users.get(req.params.id).then(function(user) {
    if (user && user.twitch !== null) {
      db.users.get(req.params.id).then(function(user) {
        helpers.twitch_settings.getChannel(user.twitch).then(function(api) {
          db.twitch_settings.getById(req.params.id).then(function(data) {
            if (res.locals.loggedin == req.params.id) {
              var isOwner = true;
            }
            res.render('settings_twitch', {
              title: "Twitch Settings",
              theme: "Twitch",
              data: data[0],
              api: api,
              user: user,
              isOwner: isOwner
            });
          });
        });
      });
    }
    else {
      res.render("error", {title: "Error", theme: "Neutral", code: "403", description: "You cannot access that page because the user ID provided does not have a linked Twitch account."});
    }
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

// Get settings first page
app.get('/logs/:id/', function(req, res) {
  res.render('logs_redirect', { title: "Logs", theme: "Neutral"});
});

// Get chat logs
app.get('/logs/:id/:platform/', function(req, res) {
  if (req.params.platform == "twitch") {
    res.render('logs', { title: "Twitch Chat Logs", theme: "Twitch"});
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
    res.redirect("/link/")
  }
});

// Link Account Page
app.get('/link/', function(req, res) {
  if (res.locals.loggedin) {
    res.render('link', { title: "Link Account", theme: "Neutral" });
  }
  else {
    res.redirect("/signup/")
  }
});

// Admin Root Page
app.get('/admin/', function(req, res) {
  res.render('admin', { title: "Admin Tools", theme: "Neutral" });
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
      needle.get('https://api.twitch.tv/kraken/user?oauth_token=' + body.access_token + "&client_id=" + config.twitch.auth.cid, function(error, data) {
        if(!error) {
          if (req.session.user_id) {
            db.users.updateTwitch(req.session.user_id, data.body.name).then(function(result) {
              db.twitch_settings.defaultSettings(req.session.user_id, data.body.name, data.body.display_name, data.body.logo).then(function(result) {
                res.redirect('/settings/');
              });
            });
          }
          // Login with Twitch account
          else {
            req.session.auth = body.access_token;
            req.session.name = data.body.name;
            req.session.display_name = data.body.display_name;
            db.users.getIdByTwitch(req.session.name).then(function(result) {
              if (!result) {
                db.users.generateUser(req.session.name, null, null).then(function(result) {
                  db.users.getIdByTwitch(req.session.name).then(function(result) {
                    req.session.user_id = result;
                    db.twitch_settings.defaultSettings(req.session.user_id, data.body.name, data.body.display_name, data.body.logo).then(function(result) {
                      res.redirect('/settings/');
                    });
                  });
                });
              }
              else {
                db.users.getIdByTwitch(req.session.name).then(function(result) {
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
          needle.get('https://discordapp.com/api/users/@me/guilds', {
            headers: {
              'Authorization': "Bearer " + body.access_token
            }
          }, function(error, user_servers) {
            if (req.session.user_id) {
              db.users.updateDiscordId(req.session.user_id, data.body.id).then(function(result) {
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
            else {
              req.session.auth = body.access_token;
              req.session.name = data.body.id;
              req.session.display_name = data.body.username;
              db.users.getIdByDiscord(req.session.name).then(function(result) {
                if (!result) {
                  db.users.generateUser(null, req.session.name, null).then(function(result) {
                    db.users.getIdByDiscord(req.session.name).then(function(result) {
                      req.session.user_id = result;
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
                  });
                }
                else {
                  db.users.getIdByDiscord(req.session.name).then(function(result) {
                    req.session.user_id = result;
                    res.redirect('/settings/');
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
            db.users.updateBeam(req.session.user_id, data.body.username.toLowerCase()).then(function(result) {
              db.beam_settings.defaultSettings(req.session.user_id, data.body.channel.id, data.body.username, data.body.avatar).then(function(result) {
                res.redirect('/settings/');
              });
            });
          }
          else {
            req.session.auth = body.access_token;
            req.session.name = data.body.username.toLowerCase();
            req.session.display_name = data.body.username;
            db.users.getIdByBeam(req.session.name).then(function(result) {
              if (!result) {
                db.users.generateUser(null, null, req.session.name).then(function(result) {
                  db.users.getIdByBeam(req.session.name).then(function(result) {
                    req.session.user_id = result;
                    db.beam_settings.defaultSettings(req.session.user_id, data.body.channel.id, data.body.username, data.body.avatar).then(function(result) {
                      res.redirect('/settings/');
                    });
                  });
                });
              }
              else {
                db.users.getIdByBeam(req.session.name).then(function(result) {
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
  db.users.updateTwitch(req.body.id, null);
  db.twitch_settings.delete(req.body.id);
  return;
});

// Unlink Discord Account
app.post('/unlink/discord/', function(req, res) {
  db.users.updateDiscordId(req.body.id, null);
  db.users.updateDiscordServer(req.body.id, null);
  db.discord_settings.delete(req.body.id);
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

// Toggle Twitch Actions Protection
app.post('/twitch/protection/actions/toggle/', function(req, res) {
  db.twitch_settings.getByUsername(req.body.channel).then(function(data) {
    data[0].spam.actions.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data[0].user_id, data[0]);
  });
});

// Update Twitch Actions Protection Settings
app.post('/twitch/protection/actions/update/', function(req, res) {
  db.twitch_settings.getByUsername(req.body.channel).then(function(data) {
    data[0].spam.actions.warning = (req.body.warning === "true");
    data[0].spam.actions.post_message = (req.body.post_message === "true");
    data[0].spam.actions.whisper_message = (req.body.whisper_message === "true");
    data[0].spam.actions.warning_length = parseInt(req.body.warning_length);
    data[0].spam.actions.length = parseInt(req.body.length);
    data[0].spam.actions.message = req.body.message;
    data[0].spam.actions.level = parseInt(req.body.level);
    if (isNaN(data[0].spam.actions.warning_length)) {
      data[0].spam.actions.warning_length = 1;
    }
    if (isNaN(data[0].spam.actions.length)) {
      data[0].spam.actions.length = 600;
    }
    if (isNaN(data[0].spam.actions.level)) {
      data[0].spam.actions.level = 600;
    }
    db.twitch_settings.update(data[0].user_id, data[0]);
  });
});

// Toggle Twitch Blacklist Protection
app.post('/twitch/protection/blacklist/toggle/', function(req, res) {
  db.twitch_settings.getByUsername(req.body.channel).then(function(data) {
    data[0].spam.blacklist.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data[0].user_id, data[0]);
  });
});

// Update Twitch Blacklist Protection Settings
app.post('/twitch/protection/blacklist/update/', function(req, res) {
  db.twitch_settings.getByUsername(req.body.channel).then(function(data) {
    data[0].spam.blacklist.blacklist = req.body.blacklist;
    data[0].spam.blacklist.warning = (req.body.warning === "true");
    data[0].spam.blacklist.post_message = (req.body.post_message === "true");
    data[0].spam.blacklist.whisper_message = (req.body.whisper_message === "true");
    data[0].spam.blacklist.warning_length = parseInt(req.body.warning_length);
    data[0].spam.blacklist.length = parseInt(req.body.length);
    data[0].spam.blacklist.message = req.body.message;
    data[0].spam.blacklist.level = parseInt(req.body.level);
    if (isNaN(data[0].spam.blacklist.warning_length)) {
      data[0].spam.blacklist.warning_length = 1;
    }
    if (isNaN(data[0].spam.blacklist.length)) {
      data[0].spam.blacklist.length = 600;
    }
    if (isNaN(data[0].spam.blacklist.level)) {
      data[0].spam.blacklist.level = 600;
    }
    db.twitch_settings.update(data[0].user_id, data[0]);
  });
});

// Toggle Twitch Caps Protection
app.post('/twitch/protection/caps/toggle/', function(req, res) {
  db.twitch_settings.getByUsername(req.body.channel).then(function(data) {
    data[0].spam.caps.enabled = (req.body.enabled === "true");
    db.twitch_settings.update(data[0].user_id, data[0]);
  });
});

// Update Twitch Caps Protection Settings
app.post('/twitch/protection/caps/update/', function(req, res) {
  db.twitch_settings.getByUsername(req.body.channel).then(function(data) {
    data[0].spam.caps.minimum_length = parseInt(req.body.minimum_length);
    data[0].spam.caps.percentage = parseInt(req.body.percentage);
    data[0].spam.caps.warning = (req.body.warning === "true");
    data[0].spam.caps.post_message = (req.body.post_message === "true");
    data[0].spam.caps.whisper_message = (req.body.whisper_message === "true");
    data[0].spam.caps.warning_length = parseInt(req.body.warning_length);
    data[0].spam.caps.length = parseInt(req.body.length);
    data[0].spam.caps.message = req.body.message;
    data[0].spam.caps.level = parseInt(req.body.level);
    if (isNaN(data[0].spam.caps.warning_length)) {
      data[0].spam.caps.warning_length = 1;
    }
    if (isNaN(data[0].spam.caps.length)) {
      data[0].spam.caps.length = 600;
    }
    if (isNaN(data[0].spam.caps.level)) {
      data[0].spam.caps.level = 600;
    }
    if (isNaN(data[0].spam.caps.minimum_length)) {
      data[0].spam.caps.minimum_length = 8;
    }
    if (isNaN(data[0].spam.caps.percentage)) {
      data[0].spam.caps.percentage = 70;
    }
    db.twitch_settings.update(data[0].user_id, data[0]);
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
