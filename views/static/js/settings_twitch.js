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

$(document).delegate("#permit-user", "click", function() {
  var channel = $(this).data("channel"),
      loggedin = $(this).data("user"),
      user = $("#permit-user-name").val();
  $.post('/twitch/protection/permit/', {
    channel: channel,
    loggedin: loggedin,
    user: user
  });
  Materialize.toast(user + " has been given a permit on the channel.", 4000);
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

$(document).delegate("#actions-protection-message-toggle", "change", function() {
  if ($("#actions-protection-message-toggle").prop("checked") === false) {
    $("#actions-protection-whisper-toggle").prop("checked", false);
    $("#actions-protection-whisper-toggle").prop("disabled", true);
    $("#actions-protection-message").prop("disabled", true);
  }
  else {
    $("#actions-protection-whisper-toggle").prop("disabled", false);
    $("#actions-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#actions-protection-warning-toggle", "change", function() {
  if ($("#actions-protection-warning-toggle").prop("checked") === false) {
    $("#actions-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#actions-protection-warning-length").prop("disabled", false);
  }
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

$(document).delegate("#blacklist-protection-message-toggle", "change", function() {
  if ($("#blacklist-protection-message-toggle").prop("checked") === false) {
    $("#blacklist-protection-whisper-toggle").prop("checked", false);
    $("#blacklist-protection-whisper-toggle").prop("disabled", true);
    $("#blacklist-protection-message").prop("disabled", true);
  }
  else {
    $("#blacklist-protection-whisper-toggle").prop("disabled", false);
    $("#blacklist-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#blacklist-protection-warning-toggle", "change", function() {
  if ($("#blacklist-protection-warning-toggle").prop("checked") === false) {
    $("#blacklist-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#blacklist-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#caps-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#caps-protection-toggle").prop("checked");
  $.post('/twitch/protection/caps/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#caps-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#caps-protection-warning-toggle").prop("checked"),
      post_message = $("#caps-protection-message-toggle").prop("checked"),
      whisper_message = $("#caps-protection-whisper-toggle").prop("checked"),
      warning_length = $("#caps-protection-warning-length").val(),
      length = $("#caps-protection-length").val(),
      message = $("#caps-protection-message").val(),
      level = $("#caps-protection-level option:selected").data("level"),
      minimum_length = $("#caps-protection-minimum-length").val(),
      percentage = $("#caps-protection-percentage").val();
  $.post('/twitch/protection/caps/update/', {
    channel: channel,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level,
    minimum_length: minimum_length,
    percentage: percentage
  });
});

$(document).delegate("#caps-protection-message-toggle", "change", function() {
  if ($("#caps-protection-message-toggle").prop("checked") === false) {
    $("#caps-protection-whisper-toggle").prop("checked", false);
    $("#caps-protection-whisper-toggle").prop("disabled", true);
    $("#caps-protection-message").prop("disabled", true);
  }
  else {
    $("#caps-protection-whisper-toggle").prop("disabled", false);
    $("#caps-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#caps-protection-warning-toggle", "change", function() {
  if ($("#caps-protection-warning-toggle").prop("checked") === false) {
    $("#caps-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#caps-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#excess-emotes-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#excess-emotes-protection-toggle").prop("checked");
  $.post('/twitch/protection/emotes/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#excess-emotes-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#excess-emotes-protection-warning-toggle").prop("checked"),
      post_message = $("#excess-emotes-protection-message-toggle").prop("checked"),
      whisper_message = $("#excess-emotes-protection-whisper-toggle").prop("checked"),
      warning_length = $("#excess-emotes-protection-warning-length").val(),
      length = $("#excess-emotes-protection-length").val(),
      message = $("#excess-emotes-protection-message").val(),
      level = $("#excess-emotes-protection-level option:selected").data("level"),
      limit = $("#excess-emotes-protection-limit").val();
  $.post('/twitch/protection/emotes/update/', {
    channel: channel,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level,
    limit: limit
  });
});

$(document).delegate("#excess-emotes-protection-message-toggle", "change", function() {
  if ($("#excess-emotes-protection-message-toggle").prop("checked") === false) {
    $("#excess-emotes-protection-whisper-toggle").prop("checked", false);
    $("#excess-emotes-protection-whisper-toggle").prop("disabled", true);
    $("#excess-emotes-protection-message").prop("disabled", true);
  }
  else {
    $("#excess-emotes-protection-whisper-toggle").prop("disabled", false);
    $("#excess-emotes-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#excess-emotes-protection-warning-toggle", "change", function() {
  if ($("#excess-emotes-protection-warning-toggle").prop("checked") === false) {
    $("#excess-emotes-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#excess-emotes-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#ips-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#ips-protection-toggle").prop("checked");
  $.post('/twitch/protection/ips/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#ips-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#ips-protection-warning-toggle").prop("checked"),
      post_message = $("#ips-protection-message-toggle").prop("checked"),
      whisper_message = $("#ips-protection-whisper-toggle").prop("checked"),
      warning_length = $("#ips-protection-warning-length").val(),
      length = $("#ips-protection-length").val(),
      message = $("#ips-protection-message").val(),
      level = $("#ips-protection-level option:selected").data("level"),
      prevent_evasion = $("#ips-protection-evasion-toggle").prop("checked"),
      permit = $("#ips-protection-permit-toggle").prop("checked"),
      whitelist = $("#ips-protection-whitelist").val().split(/\n/);
  $.post('/twitch/protection/ips/update/', {
    channel: channel,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level,
    prevent_evasion: prevent_evasion,
    permit: permit,
    whitelist: whitelist
  });
});

$(document).delegate("#ips-protection-message-toggle", "change", function() {
  if ($("#ips-protection-message-toggle").prop("checked") === false) {
    $("#ips-protection-whisper-toggle").prop("checked", false);
    $("#ips-protection-whisper-toggle").prop("disabled", true);
    $("#ips-protection-message").prop("disabled", true);
  }
  else {
    $("#ips-protection-whisper-toggle").prop("disabled", false);
    $("#ips-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#ips-protection-warning-toggle", "change", function() {
  if ($("#ips-protection-warning-toggle").prop("checked") === false) {
    $("#ips-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#ips-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#links-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#links-protection-toggle").prop("checked");
  $.post('/twitch/protection/links/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#links-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#links-protection-warning-toggle").prop("checked"),
      post_message = $("#links-protection-message-toggle").prop("checked"),
      whisper_message = $("#links-protection-whisper-toggle").prop("checked"),
      warning_length = $("#links-protection-warning-length").val(),
      length = $("#links-protection-length").val(),
      message = $("#links-protection-message").val(),
      level = $("#links-protection-level option:selected").data("level"),
      prevent_evasion = $("#links-protection-evasion-toggle").prop("checked"),
      permit = $("#links-protection-permit-toggle").prop("checked"),
      whitelist = $("#links-protection-whitelist").val().split(/\n/);
  $.post('/twitch/protection/links/update/', {
    channel: channel,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level,
    prevent_evasion: prevent_evasion,
    permit: permit,
    whitelist: whitelist
  });
});

$(document).delegate("#links-protection-message-toggle", "change", function() {
  if ($("#links-protection-message-toggle").prop("checked") === false) {
    $("#links-protection-whisper-toggle").prop("checked", false);
    $("#links-protection-whisper-toggle").prop("disabled", true);
    $("#links-protection-message").prop("disabled", true);
  }
  else {
    $("#links-protection-whisper-toggle").prop("disabled", false);
    $("#links-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#links-protection-warning-toggle", "change", function() {
  if ($("#links-protection-warning-toggle").prop("checked") === false) {
    $("#links-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#links-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#lone-emotes-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#lone-emotes-protection-toggle").prop("checked");
  $.post('/twitch/protection/lones/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#lone-emotes-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#lone-emotes-protection-warning-toggle").prop("checked"),
      post_message = $("#lone-emotes-protection-message-toggle").prop("checked"),
      whisper_message = $("#lone-emotes-protection-whisper-toggle").prop("checked"),
      warning_length = $("#lone-emotes-protection-warning-length").val(),
      length = $("#lone-emotes-protection-length").val(),
      message = $("#lone-emotes-protection-message").val(),
      level = $("#lone-emotes-protection-level option:selected").data("level");
  $.post('/twitch/protection/lones/update/', {
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

$(document).delegate("#lone-emotes-protection-message-toggle", "change", function() {
  if ($("#lone-emotes-protection-message-toggle").prop("checked") === false) {
    $("#lone-emotes-protection-whisper-toggle").prop("checked", false);
    $("#lone-emotes-protection-whisper-toggle").prop("disabled", true);
    $("#lone-emotes-protection-message").prop("disabled", true);
  }
  else {
    $("#lone-emotes-protection-whisper-toggle").prop("disabled", false);
    $("#lone-emotes-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#lone-emotes-protection-warning-toggle", "change", function() {
  if ($("#lone-emotes-protection-warning-toggle").prop("checked") === false) {
    $("#lone-emotes-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#lone-emotes-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#paragraph-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#paragraph-protection-toggle").prop("checked");
  $.post('/twitch/protection/paragraph/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#paragraph-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#paragraph-protection-warning-toggle").prop("checked"),
      post_message = $("#paragraph-protection-message-toggle").prop("checked"),
      whisper_message = $("#paragraph-protection-whisper-toggle").prop("checked"),
      warning_length = $("#paragraph-protection-warning-length").val(),
      length = $("#paragraph-protection-length").val(),
      message = $("#paragraph-protection-message").val(),
      level = $("#paragraph-protection-level option:selected").data("level"),
      limit = $("#paragraph-protection-limit").val();
  $.post('/twitch/protection/paragraph/update/', {
    channel: channel,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level,
    limit: limit
  });
});

$(document).delegate("#paragraph-protection-message-toggle", "change", function() {
  if ($("#paragraph-protection-message-toggle").prop("checked") === false) {
    $("#paragraph-protection-whisper-toggle").prop("checked", false);
    $("#paragraph-protection-whisper-toggle").prop("disabled", true);
    $("#paragraph-protection-message").prop("disabled", true);
  }
  else {
    $("#paragraph-protection-whisper-toggle").prop("disabled", false);
    $("#paragraph-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#paragraph-protection-warning-toggle", "change", function() {
  if ($("#paragraph-protection-warning-toggle").prop("checked") === false) {
    $("#paragraph-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#paragraph-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#repitition-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#repitition-protection-toggle").prop("checked");
  $.post('/twitch/protection/repitition/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#repitition-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#repitition-protection-warning-toggle").prop("checked"),
      post_message = $("#repitition-protection-message-toggle").prop("checked"),
      whisper_message = $("#repitition-protection-whisper-toggle").prop("checked"),
      warning_length = $("#repitition-protection-warning-length").val(),
      length = $("#repitition-protection-length").val(),
      message = $("#repitition-protection-message").val(),
      level = $("#repitition-protection-level option:selected").data("level");
  $.post('/twitch/protection/repitition/update/', {
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

$(document).delegate("#repitition-protection-message-toggle", "change", function() {
  if ($("#repitition-protection-message-toggle").prop("checked") === false) {
    $("#repitition-protection-whisper-toggle").prop("checked", false);
    $("#repitition-protection-whisper-toggle").prop("disabled", true);
    $("#repitition-protection-message").prop("disabled", true);
  }
  else {
    $("#repitition-protection-whisper-toggle").prop("disabled", false);
    $("#repitition-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#repitition-protection-warning-toggle", "change", function() {
  if ($("#repitition-protection-warning-toggle").prop("checked") === false) {
    $("#repitition-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#repitition-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#symbols-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#symbols-protection-toggle").prop("checked");
  $.post('/twitch/protection/symbols/toggle/', {
    channel: channel,
    enabled: enabled
  });
});

$(document).delegate("#symbols-protection-update", "click", function() {
  var channel = $(this).data("channel"),
      warning = $("#symbols-protection-warning-toggle").prop("checked"),
      post_message = $("#symbols-protection-message-toggle").prop("checked"),
      whisper_message = $("#symbols-protection-whisper-toggle").prop("checked"),
      warning_length = $("#symbols-protection-warning-length").val(),
      length = $("#symbols-protection-length").val(),
      message = $("#symbols-protection-message").val(),
      level = $("#symbols-protection-level option:selected").data("level"),
      minimum_length = $("#symbols-protection-minimum-length").val(),
      percentage = $("#symbols-protection-percentage").val();
  $.post('/twitch/protection/symbols/update/', {
    channel: channel,
    warning: warning,
    post_message: post_message,
    whisper_message: whisper_message,
    warning_length: warning_length,
    length: length,
    message: message,
    level: level,
    minimum_length: minimum_length,
    percentage: percentage
  });
});

$(document).delegate("#symbols-protection-message-toggle", "change", function() {
  if ($("#symbols-protection-message-toggle").prop("checked") === false) {
    $("#symbols-protection-whisper-toggle").prop("checked", false);
    $("#symbols-protection-whisper-toggle").prop("disabled", true);
    $("#symbols-protection-message").prop("disabled", true);
  }
  else {
    $("#symbols-protection-whisper-toggle").prop("disabled", false);
    $("#symbols-protection-message").prop("disabled", false);
  }
});

$(document).delegate("#symbols-protection-warning-toggle", "change", function() {
  if ($("#symbols-protection-warning-toggle").prop("checked") === false) {
    $("#symbols-protection-warning-length").prop("disabled", true);
  }
  else {
    $("#symbols-protection-warning-length").prop("disabled", false);
  }
});

$(document).delegate("#excess-emotes-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#excess-emotes-protection-toggle").prop("checked");
  $.post('/twitch/protection/emotes/toggle/', {
    channel: channel,
    enabled: enabled
  });
});
