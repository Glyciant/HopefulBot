var	config = require('./config'),
  schema = require('./schema'),
  thinky = require('thinky')({host:config.rethink.host, port:config.rethink.port, db: config.rethink.db}),
	r = thinky.r,
	type = thinky.type,
	Query = thinky.Query,
  DiscordLogModel = thinky.createModel('discord_logs', schema.discordlogs, schema.primarykey.discordlogs),
  DiscordSettingsModel = thinky.createModel('discord_settings', schema.twitchsettings, schema.primarykey.twitchsettings),
  TwitchLogModel = thinky.createModel('twitch_logs', schema.twitchlogs, schema.primarykey.twitchlogs),
  TwitchSettingsModel = thinky.createModel('twitch_settings', schema.twitchsettings, schema.primarykey.twitchsettings),
  CommandsModel = thinky.createModel('commands', schema.commands, schema.primarykey.commands),
  StatsModel = thinky.createModel('stats', schema.stats, schema.primarykey.stats);

var discord_logs = {
  addEntry: (object) => {
    return new Promise((resolve, reject) => {
      DiscordLogModel.insert(object).then((db) => {
        resolve(db);
      });
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      DiscordLogModel.then((db) => {
        resolve(db);
      });
    });
  },
  bot: () => {
    return new Promise((resolve, reject) => {
      DiscordLogModel.filter({author_id: "176399321313312768"}).then((db) => {
        resolve(db);
      });
    });
  }
};

var discord_settings = {
  add: (object) => {
    return new Promise((resolve, reject) => {
      DiscordSettingsModel.insert(object).then((db) => {
        resolve(db);
      });
    });
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      DiscordSettingsModel.filter({id: id}).then((db) => {
        resolve(db);
      });
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      DiscordSettingsModel.then((db) => {
        resolve(db);
      });
    });
  },
  update: (id, object) => {
    return new Promise((resolve, reject) => {
      DiscordSettingsModel.filter({id: id}).update(object).then((db) => {
        resolve(db);
      });
    });
  }
};

var twitch_logs = {
  addEntry: (object) => {
    return new Promise((resolve, reject) => {
      TwitchLogModel.insert(object).then((db) => {
        resolve(db);
      });
    });
  },
  getChannel: (id) => {
    return new Promise((resolve, reject) => {
      TwitchLogModel.filter({channel: id}).then((db) => {
        resolve(db);
      });
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      TwitchLogModel.then((db) => {
        resolve(db);
      });
    });
  },
  bot: () => {
    return new Promise((resolve, reject) => {
      TwitchLogModel.filter({display_name: "Heepsbot"}).then((db) => {
        resolve(db);
      });
    });
  }
};

var twitch_settings = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.then((db) => {
        resolve(db);
      });
    });
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.filter({id: id}).then((db) => {
        resolve(db);
      });
    });
  },
  update: (id, object) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.filter({id: id}).update(object).then((db) => {
        resolve(db);
      });
    });
  },
  getLink: (discord) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.filter({discord: discord}).then((db) => {
        resolve(db);
      });
    });
  },
  add: (object) => {
    return new Promise((resolve, reject) => {
      TwitchSettingsModel.insert(object).then((db) => {
        resolve(db);
      });
    });
  }
};

var commands = {
  add: (object) => {
    return new Promise((resolve, reject) => {
      CommandsModel.insert(object).then((db) => {
        resolve(db);
      });
    });
  },
  getAll: (channel) => {
    return new Promise((resolve, reject) => {
      CommandsModel.filter({channel: channel}).then((db) => {
        resolve(db);
      });
    });
  },
  getCommand: (name, channel) => {
    return new Promise((resolve, reject) => {
      CommandsModel.filter({name: name, channel: channel}).then((db) => {
        resolve(db);
      });
    });
  },
  update: (object) => {
    return new Promise((resolve, reject) => {
      CommandsModel.filter({id: object.id}).update(object).then((db) => {
        resolve(db);
      });
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      CommandsModel.filter({id: id}).delete().then((db) => {
        resolve(db);
      });
    });
  }
}

var stats = {
  get: () => {
    return new Promise((resolve, reject) => {
      StatsModel.then((db) => {
        resolve(db);
      });
    });
  },
  update: (object) => {
    return new Promise((resolve, reject) => {
      StatsModel.update(object).then((db) => {
        resolve(db);
      });
    });
  }
}

module.exports = {
  discord_settings: discord_settings,
  discord_logs: discord_logs,
  twitch_settings: twitch_settings,
  twitch_logs: twitch_logs,
  commands: commands,
  stats: stats
}
