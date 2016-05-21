$(document).delegate("#toggle-spam", "click", function() {
  $("#panel-spam").toggleClass("panel-hidden");
  if ($(this).html() == "- Hide Panel") {
    $(this).html("+ Show Panel");
  }
  else {
    $(this).html("- Hide Panel");
  }
});

$(document).delegate("#toggle-commands", "click", function() {
  $("#panel-commands").toggleClass("panel-hidden");
  if ($(this).html() == "- Hide Panel") {
    $(this).html("+ Show Panel");
  }
  else {
    $(this).html("- Hide Panel");
  }
});

$(document).delegate("#toggle-features", "click", function() {
  $("#panel-features").toggleClass("panel-hidden");
  if ($(this).html() == "- Hide Panel") {
    $(this).html("+ Show Panel");
  }
  else {
    $(this).html("- Hide Panel");
  }
});

$(document).delegate("#toggle-documentation", "click", function() {
  $("#panel-documentation").toggleClass("panel-hidden");
  if ($(this).html() == "- Hide Panel") {
    $(this).html("+ Show Panel");
  }
  else {
    $(this).html("- Hide Panel");
  }
});

$(document).delegate("#update-stream-data", "click", function() {
  var status = $("#stream-title").val(),
      channel = $(this).data("channel"),
      game = $("#stream-game").val();

  $.post("/twitch/api/update", {
    status: status,
    channel: channel,
    game: game
  });
});
