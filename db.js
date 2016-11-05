var mongodb = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    assert = require('assert'),
    helpers = require('./helpers'),
    url = "mongodb://localhost:27017/heepsbot";

var users = {
  generateUser: (twitch, discord, beam) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").insertOne({
          twitch: twitch,
          discord_id: discord,
          discord_server: null,
          beam: beam,
          commands: [],
          aliases: []
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          resolve(result);
        });
      });
    });
  },
  get: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").findOne({
          _id: ObjectID(id)
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  getIdByTwitch: (twitch) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").findOne({
          twitch: twitch
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result._id);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  getIdByDiscord: (discord) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").findOne({
          discord_id: discord
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result._id);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  getIdByBeam: (beam) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").findOne({
          beam: beam
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result._id);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  updateTwitch: (id, twitch) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").updateOne({
          _id: ObjectID(id)
        }, {
          $set: { twitch: twitch }
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  updateDiscordId: (id, discord) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").updateOne({
          _id: ObjectID(id)
        }, {
          $set: { discord_id: discord }
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  updateDiscordServer: (id, discord) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").updateOne({
          _id: ObjectID(id)
        }, {
          $set: { discord_server: discord }
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  updateBeam: (id, beam) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").updateOne({
          _id: ObjectID(id)
        }, {
          $set: { beam: beam }
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  }
};

var twitch_settings = {
  defaultSettings: (id, username, display_name, icon) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").insertOne(helpers.twitch_settings.defaultSettings(id, username, display_name, icon), function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
              resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").deleteOne({ user_id: id }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").find({}, function(err, result) {
          result.toArray().then(function(arrayResult) {
            assert.equal(null, err);
            db.close();
            if (arrayResult) {
              resolve(arrayResult);
            }
            else {
              resolve(null);
            }
          });
        });
      });
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").find({
          user_id: ObjectID(id)
        }, function(err, result) {
          result.toArray().then(function(arrayResult) {
            assert.equal(null, err);
            db.close();
            if (arrayResult) {
              resolve(arrayResult);
            }
            else {
              resolve(null);
            }
          });
        });
      });
    });
  },
  getByUsername: (username) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").find({
          username: username
        }, function(err, result) {
          result.toArray().then(function(arrayResult) {
            assert.equal(null, err);
            db.close();
            if (arrayResult) {
              resolve(arrayResult);
            }
            else {
              resolve(null);
            }
          });
        });
      });
    });
  },
  update: (id, object) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").update({
          user_id: ObjectID(id),
        }, object,
        function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  }
};

var discord_settings = {
  defaultSettings: (user_id, server_id, name, icon) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("discord_settings").insertOne(helpers.discord_settings.defaultSettings(user_id, server_id, name, icon), function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("discord_settings").deleteOne({ user_id: id }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("discord_settings").find({}, function(err, result) {
          result.toArray().then(function(arrayResult) {
            assert.equal(null, err);
            db.close();
            if (arrayResult) {
              resolve(arrayResult);
            }
            else {
              resolve(null);
            }
          });
        });
      });
    });
  }
};

var beam_settings = {
  defaultSettings: (user_id, chat_id, name, icon) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("beam_settings").insertOne(helpers.beam_settings.defaultSettings(user_id, chat_id, name, icon), function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  delete: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("beam_settings").deleteOne({ user_id: id }, function(err, result) {
          assert.equal(null, err);
          db.close();
          if (result) {
            resolve(result);
          }
          else {
            resolve(null);
          }
        });
      });
    });
  },
  getAll: () => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("beam_settings").find({}, function(err, result) {
          result.toArray().then(function(arrayResult) {
            assert.equal(null, err);
            db.close();
            if (arrayResult) {
              resolve(arrayResult);
            }
            else {
              resolve(null);
            }
          });
        });
      });
    });
  }
};

var twitch_logs = {
  add: (channel, username, message, date) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_logs").insertOne({
          channel: channel,
          username: username,
          message: message,
          date: date
        }, function(err, result) {
          assert.equal(null, err);
          db.close();
          resolve(result);
        });
      });
    });
  },
  getChannel: (channel) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_logs").find({
          channel: channel
        }, function(err, result) {
          result.sort({date: -1}).toArray().then(function(arrayResult) {
            assert.equal(null, err);
            db.close();
            if (arrayResult) {
              resolve(arrayResult);
            }
            else {
              resolve(null);
            }
          });
        });
      });
    });
  },
  getUserInChannel: (channel, user) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_logs").find({
          channel: channel,
          username: user
        }, function(err, result) {
          result.sort({date: -1}).toArray().then(function(arrayResult) {
            assert.equal(null, err);
            db.close();
            if (arrayResult) {
              resolve(arrayResult);
            }
            else {
              resolve(null);
            }
          });
        });
      });
    });
  }
};

module.exports = {
  users: users,
  twitch_settings: twitch_settings,
  discord_settings: discord_settings,
  beam_settings: beam_settings,
  twitch_logs: twitch_logs
};
