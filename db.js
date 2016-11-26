var mongodb = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    assert = require('assert'),
    helpers = require('./db_helpers'),
    url = "mongodb://localhost:27017/hopefulbot";

var users = {
  generateUser: (twitch_id, twitch_name, discord_id, discord_name, beam_id, beam_name) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").insertOne(helpers.defaultSettings.general(twitch_id, twitch_name, discord_id, discord_name, beam_id, beam_name), function(err, result) {
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
  getUserIdByTwitchId: (twitch) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").findOne({
          twitch_id: twitch.toString()
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
  getUserIdByDiscordId: (discord) => {
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
  getUserIdByBeamId: (beam) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").findOne({
          beam_id: beam
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
  updateTwitch: (id, twitch_name, twitch_id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").updateOne({
          _id: ObjectID(id)
        }, {
          $set: { twitch_name: twitch_name, twitch_id: twitch_id }
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
  updateDiscordUser: (id, discord_id, discord_name) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").updateOne({
          _id: ObjectID(id)
        }, {
          $set: { discord_id: discord_id, discord_name: discord_name }
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
  updateBeam: (id, beam_name, beam_id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("users").updateOne({
          _id: ObjectID(id)
        }, {
          $set: { beam_name: beam_name, beam_id: beam_id }
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
  defaultSettings: (user_id, id, username, display_name, icon) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").insertOne(helpers.defaultSettings.twitch(user_id.toString(), id.toString(), username, display_name, icon), function(err, result) {
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
  getByUserId: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").findOne({
          user_id: id.toString()
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
  getByTwitchId: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").findOne({
          id: id.toString()
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
  getByTwitchUsername: (username) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").findOne({
          username: username
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
  update: (id, object) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("twitch_settings").update({
          user_id: id,
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
        db.collection("discord_settings").insertOne(helpers.defaultSettings.discord(user_id.toString(), server_id, name, icon), function(err, result) {
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
  },
  getByUserId: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("discord_settings").findOne({
          user_id: id
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
  getByServerId: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("discord_settings").findOne({
          server_id: id
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

var beam_settings = {
  defaultSettings: (user_id, chat_id, name, icon) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("beam_settings").insertOne(helpers.defaultSettings.beam(user_id.toString(), chat_id, name, icon), function(err, result) {
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
  },
  getByUserId: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("beam_settings").findOne({
          user_id: id
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
  getByBeamId: (id) => {
    return new Promise((resolve, reject) => {
      mongodb.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection("beam_settings").findOne({
          id: id.toString()
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
