$(document).delegate("#add-command", "click", function() {
  var name = $("#command_name").val(),
      response = $("#command_response").val(),
      reward = parseInt($("#command_reward").val()),
      cost = parseInt($("#command_cost").val()),
      cooldown = parseInt($("#command_cooldown").val()),
      ul = $("#command_userlevel").val(),
      channel = "#" + $(this).data("user");

      $("#command_name").val(""),
      $("#command_response").val(""),
      $("#command_reward").val(""),
      $("#command_cost").val(""),
      $("#command_cooldown").val(""),
      $("#command_userlevel").val("All Users");

  if (ul == "Twitch Turbo Users") { var level = 750 }
  else if (ul == "Subscribers") { var level = 700 }
  else if (ul == "Regulars") { var level = 600 }
  else if (ul == "Moderators") { var level = 500 }
  else if (ul == "Editors") { var level = 400 }
  else if (ul == "Broadcasters") { var level = 300 }
  else if (ul == "Twitch Global Moderators") { var level = 250 }
  else if (ul == "Twitch Admins") { var level = 200 }
  else if (ul == "Twitch Staff") { var level = 100 }
  else if (ul == "Bot Admins") { var level = 50 }
  else { var level = 800 }

  $.post("/twitch/commands/add", {
    name: name,
    response: response,
    add: reward,
    cost: cost,
    cooldown: cooldown,
    level: level,
    channel: channel
  });
});

$(document).delegate("#edit-command", "click", function() {
  var id = $(this).data("id"),
      name = $("#edit-command_name-" + id).val(),
      response = $("#edit-command_response-" + id).val(),
      reward = parseInt($("#edit-command_reward-" + id).val()),
      cost = parseInt($("#edit-command_cost-" + id).val()),
      cooldown = parseInt($("#edit-command_cooldown-" + id).val()),
      ul = $("#edit-command_userlevel-" + id).val(),
      channel = "#" + $(this).data("channel");

      $("#edit-command_name-" + id).val(""),
      $("#edit-command_response-" + id).val(""),
      $("#edit-command_reward-" + id).val(""),
      $("#edit-command_cost-" + id).val(""),
      $("#edit-command_cooldown-").val(""),
      $("#edit-command_userlevel-" + id).val("All Users");

  if (ul == "Twitch Turbo Users") { var level = 750 }
  else if (ul == "Subscribers") { var level = 700 }
  else if (ul == "Regulars") { var level = 600 }
  else if (ul == "Moderators") { var level = 500 }
  else if (ul == "Editors") { var level = 400 }
  else if (ul == "Broadcasters") { var level = 300 }
  else if (ul == "Twitch Global Moderators") { var level = 250 }
  else if (ul == "Twitch Admins") { var level = 200 }
  else if (ul == "Twitch Staff") { var level = 100 }
  else if (ul == "Bot Admins") { var level = 50 }
  else { var level = 800 }

  $.post("/twitch/commands/edit", {
    id: id,
    name: name,
    response: response,
    add: reward,
    cost: cost,
    cooldown: cooldown,
    level: level,
    channel: channel
  });
});

$(document).delegate("#delete-command", "click", function() {
  var id = $(this).data("id")

  $.post("/twitch/commands/delete", {
    id: id
  });
});
