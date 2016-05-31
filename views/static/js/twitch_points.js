$(document).delegate("#get-points-user", "click", function() {

  var user = $("#points-user").val().toLowerCase(),
      channel = $(this).data("channel");

  $.post("/twitch/points/get/", { user: user, channel: channel }, function(points) {
      $("#user-points").html(points.points);
      $("#points_user").html(user);
      $("#user-results").slideDown();
  });
});

$(document).delegate("#points-preset", "click", function() {
  var user = $("#points-user").val().toLowerCase(),
      channel = $(this).data("channel"),
      points = $(this).data("points"),
      total = parseInt(points) + parseInt($("#user-points").html());

  $("#user-points").html(total);

  $.post("/twitch/points/update/", { user: user, channel: channel, points: points, type: "preset" });
});

$(document).delegate("#points-change-save", "click", function() {
  var user = $("#points-user").val().toLowerCase(),
      channel = $(this).data("channel"),
      points = $("#points-change").val();

  $("#user-points").html(points);

  $.post("/twitch/points/update/", { user: user, channel: channel, points: points, type: "set" });
});
