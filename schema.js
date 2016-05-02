var	config = require('./config');
  thinky = require('thinky')({host:config.rethink.host, port:config.rethink.port, db: config.rethink.db}),
  r = thinky.r,
  type = thinky.type,
  Query = thinky.Query;

var schema = {};

schema.primarykey = {
  discordlogs: "id",
  twitchsettings: "id",
  twitchlogs: "id"
}

schema.discordlogs = {
  id: type.string(),
  author_id: type.string(),
  author: type.string(),
  channel: type.string(),
  server_id: type.string(),
  content: type.string(),
  date: type.date()
}

schema.twitchsettings = {
  id: type.string(),
  discord: type.string()
}

schema.twitchlogs = {
  id: type.string(),
  display_name: type.string(),
  date: type.date(),
  content: type.string()
}

module.exports = schema
