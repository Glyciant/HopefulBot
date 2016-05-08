$(document).delegate("#add-editor", "click", function() {
  var editor = $("#new_editor").val(),
      channel = $(this).data("channel");

  $.post("/twitch/users/add_editor", {
    editor: editor,
    channel: channel
  });
});

$(document).delegate("#add-regular", "click", function() {
  var regular = $("#new_regular").val(),
      channel = $(this).data("channel");

  $.post("/twitch/users/add_regular", {
    regular: regular,
    channel: channel
  });
});

$(document).delegate("#remove-editor", "click", function() {
  var editor = $(this).data("user"),
      channel = $(this).data("channel");

  $.post("/twitch/users/remove_editor", {
    editor: editor,
    channel: channel
  });
});

$(document).delegate("#remove-regular", "click", function() {
  var regular = $(this).data("user"),
      channel = $(this).data("channel");

  $.post("/twitch/users/remove_regular", {
    regular: regular,
    channel: channel
  });
});
