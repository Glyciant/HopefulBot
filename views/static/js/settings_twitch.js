$(document).delegate("#bot-join-channel", "click", function() {
  var channel = $(this).data("channel");
  $.post('/twitch/channel/join/', {
    channel: channel
  });
  Materialize.toast("Heepsbot has joined the channel.", 4000);
});

$(document).delegate("#bot-part-channel", "click", function() {
  var channel = $(this).data("channel");
  $.post('/twitch/channel/part/', {
    channel: channel
  });
  Materialize.toast("Heepsbot has left the channel.", 4000);
});

$(document).delegate("#bot-rejoin-channel", "click", function() {
  var channel = $(this).data("channel");
  $.post('/twitch/channel/rejoin/', {
    channel: channel
  });
  Materialize.toast("Heepsbot has rejoined the channel.", 4000);
});

$(document).delegate("#bot-default-settings", "click", function() {
  var channel = $(this).data("channel");
  $.post('/twitch/channel/reset/', {
    channel: channel
  });
  Materialize.toast("All default settings have been restored.", 4000);
});

$(document).delegate("#update-api-status", "click", function() {
  var channel = $(this).data("channel"),
      title = $("#api-status-title").val(),
      game = $("#api-status-game").val();
  $.post('/twitch/api/status/update/', {
    channel: channel,
    title: title,
    game: game
  });
});

$(document).delegate("#actions-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#actions-protection-toggle").prop("checked");
  $.post('/twitch/protection/actions/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#actions-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#actions-protection-warning-toggle").prop("checked"),
      post_message = $("#actions-protection-message-toggle").prop("checked"),
      whisper_message = $("#actions-protection-whisper-toggle").prop("checked"),
      warning_length = $("#actions-protection-warning-length").val(),
      length = $("#actions-protection-length").val(),
      message = $("#actions-protection-message").val(),
      level = $("#actions-protection-level option:selected").data("level");
  $.post('/twitch/protection/actions/update/', {
    channel: channel,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level
  });
});

$(document).delegate("#blacklist-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#blacklist-protection-toggle").prop("checked");
  $.post('/twitch/protection/blacklist/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#blacklist-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#blacklist-protection-warning-toggle").prop("checked"),
      post_message = $("#blacklist-protection-message-toggle").prop("checked"),
      whisper_message = $("#blacklist-protection-whisper-toggle").prop("checked"),
      warning_length = $("#blacklist-protection-warning-length").val(),
      length = $("#blacklist-protection-length").val(),
      message = $("#blacklist-protection-message").val(),
      level = $("#blacklist-protection-level option:selected").data("level"),
      blacklist = $("#blacklist-protection-blacklist").val().split(/\n/);
  $.post('/twitch/protection/blacklist/update/', {
    channel: channel,
    blacklist: blacklist,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level
  });
});
