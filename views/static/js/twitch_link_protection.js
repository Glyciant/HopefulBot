$(document).delegate("#link-protection-toggle", "change", function() {
  var channel = $(this).data("channel"),
      enabled = ($(this).attr("checked"));
      console.log(enabled)
  $.post('/twitch/protection/links/toggle/', { channel: channel, enabled: enabled }, function(data) {
  });
});

$(document).delegate("#link-protection-save", "click", function() {
  var channel = $(this).data("channel"),
      ips = ($("#link-protection-ips").val() == "on"),
      prevent_evasion = ($("#link-protection-evasion").val() == "on"),
      global_links = ($("#link-protection-blacklist").val() == "on"),
      post_message = ($("#link-protection-ips").val() == "on"),
      message = $("#link-protection-message").val(),
      warning = ($("#link-protection-warning").val() == "on"),
      warning_length = $("#link-protection-warning-length").val(),
      length = $("#link-protection-length").val(),
      whitelist = $("#link-protection-whitelist").val().split("\n"),
      level = parseInt($("#link-protection-level").val().split(/[()]/)[1]);

  $.post('/twitch/protection/links/update/', { channel: channel, ips: ips, prevent_evasion: prevent_evasion, global_links: global_links, post_message: post_message, message: message, warning: warning, warning_length: warning_length, length: length, whitelist: whitelist, level: level }, function(data) {

  });
});
