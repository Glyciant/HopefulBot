$(document).delegate("#raffle-open", "click", function() {
  var channel = $(this).data("channel"),
      key = $("#raffle-key").val(),
      cost = $("#raffle-cost").val(),
      exclude_cheaters = $("#raffle-exclude-cheaters").val(),
      sub_multiplier = $("#raffle-subscriber-multiplier").val(),
      regular_multiplier = $("#raffle-regular-multiplier").val();

  $.post("/twitch/raffle/open/", {
    channel: channel,
    key: key,
    cost: cost,
    exclude_cheaters: exclude_cheaters,
    sub_multiplier: sub_multiplier,
    regular_multiplier: regular_multiplier
  }, function(data) {
    Materialize.toast(data.message, 4000);
    if (data.action == "success") {
      $("#raffle-setup").toggleClass("panel-hidden");
      $("#raffle-close").toggleClass("panel-hidden");

      $("#raffle-status").html("Open");
      $("#raffle-command").html(key);
      $("#raffle-points").html(cost);
      if (exclude_cheaters == "on") {
        $("#raffle-excluding-cheaters").html("Yes");
      }
      else {
        $("#raffle-excluding-cheaters").html("No");
      }
      $("#raffle-regular_multiplier").html(regular_multiplier);
      if (sub_multiplier) {
        $("#raffle-subscriber_multiplier").html(sub_multiplier);
      }
      $("#raffle-entrant").html("0");
    }
  })
});

$(document).delegate("#raffle-reopen", "click", function() {
  var channel = $(this).data("channel");
  $.post("/twitch/raffle/reopen", { channel: channel }, function(data) {
    Materialize.toast(data.message, 4000)
    if (data.action == "success") {
      $("#raffle-status").html("Open");
      $("#raffle-reopen").toggleClass("panel-hidden");
      $("#raffle-close").toggleClass("panel-hidden");
    }
  });
});

$(document).delegate("#raffle-close", "click", function() {
  var channel = $(this).data("channel");
  $.post("/twitch/raffle/close", { channel: channel }, function(data) {
    Materialize.toast(data.message, 4000)
    if (data.action == "success") {
      $("#raffle-status").html("Closed");
      $("#raffle-close").toggleClass("panel-hidden");
      $("#raffle-reopen").toggleClass("panel-hidden");
    }
  });
});

$(document).delegate("#raffle-update", "click", function() {
  var channel = $(this).data("channel");
  $.post("/twitch/raffle/update", { channel: channel }, function(data) {
    if (data.open === true) {
      $("#raffle-status").html("Open");
    }
    else if (data.open === false && data.key) {
      $("#raffle-status").html("Closed");
    }
    else {
      $("#raffle-status").html("Not Set Up");
    }
    $("#raffle-command").html(data.key);
    $("#raffle-points").html(data.cost);
    if (data.exclude_cheaters === true) {
      $("#raffle-excluding-cheaters").html("Yes");
    }
    else {
      $("#raffle-excluding-cheaters").html("No");
    }
    $("#raffle-regular_multiplier").html(data.regular_multiplier);
    if (data.sub_multiplier) {
      $("#raffle-subscriber_multiplier").html(data.sub_multiplier);
    }
    $("#raffle-entrant").html(data.users.length);
  })
});

$(document).delegate("#raffle-reset", "click", function() {
  var channel = $(this).data("channel");
  $.post("/twitch/raffle/reset", { channel: channel }, function(data) {
    Materialize.toast(data.message, 4000)
    if (data.action == "success") {
      $("#raffle-setup").removeClass("panel-hidden");
      $("#raffle-reopen").addClass("panel-hidden");
      $("#raffle-close").addClass("panel-hidden");
      $("#raffle-status").html("Not Set Up");
      $("#raffle-command").html("");
      $("#raffle-points").html("");
      $("#raffle-excluding-cheaters").html("");
      $("#raffle-regular_multiplier").html("");
      $("#raffle-subscriber_multiplier").html("");
      $("#raffle-entrant").html("");
    }
  })
});

$(document).delegate("#raffle-draw", "click", function() {
  var channel = $(this).data("channel");
  $.post("/twitch/raffle/draw", { channel: channel }, function(data) {
    if (data.action == "error") {
      Materialize.toast(data.message, 4000)
    }
    else {
      $("#raffle-winner-icon").attr("src", data.icon);
      $("#raffle-winne`-name").html(data.name);
      $("#raffle-winner-message").html(data.message);
      if (data.following) {
        var date = new Date(data.following)
        $("#raffle-winner-follower").html("Following");
        $("#raffle-winner-follower").attr("title", "Since " + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
        $("#raffle-winner-follower").addClass("green-text");
        $("#raffle-winner-follower").removeClass("red-text");
      }
      else {
        $("#raffle-winner-follower").html("Not Following");
        $("#raffle-winner-follower").addClass("red-text");
        $("#raffle-winner-follower").removeClass("green-text");
      }
      if (data.subscriber) {
        $("#raffle-winner-subscriber").html("Subscribed");
        $("#raffle-winner-subscriber").addClass("green-text");
        $("#raffle-winner-subscriber").removeClass("red-text");
      }
      else {
        $("#raffle-winner-subscriber").html("Not Subscribed");
        $("#raffle-winner-subscriber").addClass("red-text");
        $("#raffle-winner-subscriber").removeClass("green-text");
      }
      $("#raffle-winner-announce").data("user", data.name);
      $("#raffle-winner-remove").data("user", data.name);
      $(this).data("user");
      $("#modal-raffle-winner").openModal();
    }
  });
});

$(document).delegate("#raffle-winner-announce", "click", function() {
  var channel = $(this).data("channel")
      user = $(this).data("user");
  $.post("/twitch/raffle/announce", { channel: channel, user: user }, function(data) {
    if (data.action == "error") {
      Materialize.toast(data.message, 4000)
    }
  });
});

$(document).delegate("#raffle-winner-remove", "click", function() {
  var channel = $(this).data("channel")
      user = $(this).data("user");
  $.post("/twitch/raffle/remove", { channel: channel, user: user }, function(data) {
    Materialize.toast(data.message, 4000)
  });
});
