$(document).delegate("#link-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = $("#link-protection-toggle").prop("checked");
  $.post('/twitch/protection/links/toggle/', { channel: channel, enabled: enabled }, function(data) {
  });
});

$(document).delegate("#link-protection-save", "click", function() {
  var channel = $(this).data("channel"),
      ips = $("#link-protection-ips").prop("checked"),
      prevent_evasion = $("#link-protection-evasion").prop("checked"),
      post_message = $("#link-protection-post-message").prop("checked"),
      message = $("#link-protection-message").val(),
      warning = $("#link-protection-warning").prop("checked"),
      warning_length = $("#link-protection-warning-length").val(),
      length = $("#link-protection-length").val(),
      whitelist = $("#link-protection-whitelist").val().split(/\n/),
      level = parseInt($("#link-protection-level").val().split(/[()]/)[1]);

      console.log(level)

  if (warning_length === "") {
    warning_length = 1;
  }
  if (length === "") {
    length = 600;
  }
  if (isNaN(level) || level < 500) {
    level = 600;
  }

  $.post('/twitch/protection/links/update/', { channel: channel, ips: ips, prevent_evasion: prevent_evasion, post_message: post_message, message: message, warning: warning, warning_length: warning_length, length: length, whitelist: whitelist, level: level }, function(data) {
  });
});
