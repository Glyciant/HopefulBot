var config = require('./config');

var general = {
  isAdmin: function(user) {
    if (config.app.admins.indexOf(user) > -1) {
      return true;
    }
    else {
      return false;
    }
  }
};

var twitch_settings = {
  defaultSettings: function(id, name, icon) {
    return {
      user_id: id,
      display_name: name,
      command_prefix: "!",
      editors: [],
      regulars: [],
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
        banned_words: {
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
          miniumum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do SHOUT in chat. [$(result)]",
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
        language: {
          language: "en",
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please use English only in this chat. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        links: {
          whitelist: [],
          global_links: true,
          ips: true,
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
          miniumum_length: 8,
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
  }
};

var discord_settings = {
  defaultSettings: function(user_id, server_id, name, icon) {
    return {
      user_id: user_id,
      server_name: name,
      server_id: server_id,
      command_prefix: "!",
      editors: [],
      regulars: [],
      icon: icon,
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
        banned_words: {
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
          miniumum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do SHOUT in chat.",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        language: {
          language: "en",
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please use English only in this chat.",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        links: {
          whitelist: [],
          global_links: true,
          ips: true,
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
          miniumum_length: 8,
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
  }
};

var hitbox_settings = {
  defaultSettings: function(id, name, icon) {
    return {
      user_id: id,
      display_name: name,
      command_prefix: "!",
      editors: [],
      regulars: [],
      icon: "http://edge.sf.hitbox.tv" + icon,
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
        title: true,
        game: true,
        viewers: true,
        uptime: true,
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
        banned_words: {
          blacklist: [],
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not use banned words. [$(result)]",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        caps: {
          miniumum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do SHOUT in chat. [$(result)]",
          post_message: true,
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
          warning: true,
          warning_length: 10
        },
        language: {
          language: "en",
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please use English only in this chat. [$(result)]",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        links: {
          whitelist: [],
          global_links: true,
          ips: true,
          permit: true,
          prevent_evasion: true,
          enabled: true,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not post links without a moderator's permission. [$(result)]",
          post_message: true,
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
          warning: true,
          warning_length: 10
        },
        repitition: {
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do not repeat messages. [$(result)]",
          post_message: true,
          warning: true,
          warning_length: 10
        },
        symbols: {
          miniumum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do spam symbols in chat. [$(result)]",
          post_message: true,
          warning: true,
          warning_length: 10
        }
      },
      timers: []
    };
  }
};

var beam_settings = {
  defaultSettings: function(id, name, icon) {
    return {
      user_id: id,
      display_name: name,
      command_prefix: "!",
      editors: [],
      regulars: [],
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
        banned_words: {
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
          miniumum_length: 8,
          percentage: 70,
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please do SHOUT in chat. [$(result)]",
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
        language: {
          language: "en",
          enabled: false,
          length: 600,
          level: 600,
          message: "$(user) -> Please use English only in this chat. [$(result)]",
          post_message: true,
          whisper_message: false,
          warning: true,
          warning_length: 10
        },
        links: {
          whitelist: [],
          global_links: true,
          ips: true,
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
          miniumum_length: 8,
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
  }
};

module.exports = {
  general: general,
  twitch_settings: twitch_settings,
  discord_settings: discord_settings,
  hitbox_settings: hitbox_settings,
  beam_settings: beam_settings
};
