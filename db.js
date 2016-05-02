var	config = require('./config'),
  schema = require('./schema'),
  thinky = require('thinky')({host:config.rethink.host, port:config.rethink.port, db: config.rethink.db}),
	r = thinky.r,
	type = thinky.type,
	Query = thinky.Query,
  DiscordLogModel = thinky.createModel('discord_logs', schema.discordlogs, schema.primarykey.discordlogs);
  DiscordSettingsModel = thinky.createModel('discord_settings', schema.twitchsettings, schema.primarykey.twitchsettings);
  TwitchLogModel = thinky.createModel('twitch_logs', schema.twitchlogs, schema.primarykey.twitchlogs);
  TwitchSettingsModel = thinky.createModel('twitch_settings', schema.twitchsettings, schema.primarykey.twitchsettings);

var discord_logs = {
  addEntry: (object) => {
    return new Promise((resolve, reject) => {
      DiscordLogModel.insert(object).then((db) => {
        resolve(db)
      })
    })
  },
  getEntries: () => {
    return new Promise((resolve, reject) => {
      DiscordLogModel.then((db) => {
        resolve(db)
      })
    })
  }
}

var discord_settings = {
  add: (object) => {
    console.log(object)
    return new Promise((resolve, reject) => {
      DiscordSettingsModel.insert(object).then((db) => {
        resolve(db)
      })
    })
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      DiscordSettingsModel.filter({id: id}).then((db) => {
        resolve(db)
      })
    })
  },
  update: (id, object) => {
    return new Promise((resolve, reject) => {
      DiscordSettingsModel.filter({id: id}).update(object).then((db) => {
        resolve(db)
      })
    })
  }
}

var twitch_logs = {
  addEntry: (object) => {
    return new Promise((resolve, reject) => {
      TwitchLogModel.insert(object).then((db) => {
        resolve(db)
      })
    })
  },
  getEntries: () => {
    return new Promise((resolve, reject) => {
      TwitchLogModel.then((db) => {
        resolve(db)
      })
    })
  }
}

var twitch_settings = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.then((db) => {
        resolve(db)
      })
    })
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.filter({id: id}).then((db) => {
        resolve(db)
      })
    })
  },
  update: (id, object) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.filter({id: id}).update(object).then((db) => {
        resolve(db)
      })
    })
  },
  getLink: (discord) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.filter({discord: discord}).then((db) => {
        resolve(db)
      })
    })
  },
  add: (object) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.insert(object).then((db) => {
        resolve(db)
      })
    })
  }
}

module.exports = {
  discord_settings: discord_settings,
  discord_logs: discord_logs,
  twitch_settings: twitch_settings,
  twitch_logs: twitch_logs
}
