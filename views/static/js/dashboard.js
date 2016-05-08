$(document).delegate("#goto-twitch", "click", function() {
  window.location = "/dashboard/" + $("#twitch-channel").val() + "/twitch/";
});

$(document).delegate("#goto-discord", "click", function() {
  window.location = "/dashboard/" + $("#discord-server").val() + "/discord/";
});
