var beam = require('beam-client-node'),
    beamSocket = require('beam-client-node/lib/ws'),
    db = require('./db'),
    config = require('./config'),
    beamBot = new beam(),
    userInfo;

prepareSocket(316990);
prepareSocket(326666);
db.beam_settings.getAll().then(function(result) {
  for (var i in result) {
    prepareSocket(result[i].id);
  }
});

function prepareSocket(channelId) {
  beamBot.use('password', {
      username: 'HopefulBot',
      password: config.beam.bot,
  })
  .attempt()
  .then(response => {
      userInfo = response.body;
      return beamBot.chat.join(channelId);
  })
  .then(response => {
      var body = response.body;
      return createChatSocket(userInfo.id, channelId, body.endpoints, body.authkey);
  })
  .catch(error => {
      console.log('Something went wrong:', error);
  });
}

function createChatSocket(userId, channelId, endpoints, authkey) {
    // Chat connection
    var socket = new beamSocket(endpoints).boot();

    // Handle errors
    socket.on('error', error => {
        console.error('Socket error', error);
    });

    // Display successful login message
    return socket.auth(channelId, userId, authkey)
    .then(() => {
        console.log('[BEAM] Login successful for channel ID: ' + channelId);
    });
}
