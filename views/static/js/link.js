$(document).delegate("#unlink-twitch", "click", function() {
  $.post("/unlink/twitch/", {
    id: $(this).data("id")
  });
  window.location = "/settings/";
});

$(document).delegate("#unlink-discord", "click", function() {
  $.post("/unlink/discord/", {
    id: $(this).data("id")
  });
  window.location = "/settings/";
});

$(document).delegate("#unlink-beam", "click", function() {
  $.post("/unlink/beam/", {
    id: $(this).data("id")
  });
  window.location = "/settings/";
});
