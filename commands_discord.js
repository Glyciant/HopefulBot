var discord = require('discord.js'),
    discordBot = new discord.Client(),
    config = require('./config');

function discordlogin() {
  discordBot.login(config.discord.bot).then(success).catch(err);
  function success(token) { console.log("[DISCORD] Login Successful!"); }
  function err(error) { console.log("[DISCORD] Login Failed! Arguments: " + arguments); }
}

discordlogin();

discordBot.on("disconnected", function() {
  discordlogin();
});

var botServers = function() {
  return discordBot.guilds.array();
};

var leaveServer = function(server) {
  server.leave();
};

module.exports = {
  botServers: botServers,
  leaveServer: leaveServer
};
