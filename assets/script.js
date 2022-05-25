// timer
var timerObj = { time: 0, active: false };
// for context menu
var rightClickedLocation = 0;
var rightClickedName = "";
// track which element triggered the modal
var modalTrigger = "";

// create new location card and apply new ID number and data-location number
function newLocation(locationName, locationInfo, locationPlayers) {
   // clone the dummy card
   var cloneCard = $(".card-wrapper").first().clone();
   // get new location number
   var newLocId = $(".card-wrapper").length - 1;
   // edit appropriate attributes
   cloneCard.removeClass("d-none");
   cloneCard.find(".card").attr("data-location", newLocId);
   cloneCard.appendTo("#cards-container");
   cloneCard.find(".card").attr("id", "card-" + newLocId);
   cloneCard
      .find(".accordion-collapse")
      .attr("id", "accordion-panel-" + newLocId);
   cloneCard
      .find("button")
      .attr("data-bs-target", "#accordion-panel-" + newLocId);
   cloneCard.find("button").text(locationName);
   cloneCard.find(".accordion-body").text(locationInfo);
   // add player(s) to list (if argument passed)
   if (locationPlayers != undefined) {
      locationPlayers.forEach(function (item) {
         appendPlayer(newLocId, item);
      });
   }
}

// append player list item
function appendPlayer(locationId, playerObj) {
   // create new element with appropriate attributes
   var newListElement = $(
      '<li class="list-group-item" data-uid="' +
         uid(playerObj.name) +
         '" data-status="' +
         playerObj.status +
         '" data-location="' +
         locationId +
         '"><span class="player-name">' +
         playerObj.name +
         "</span></li>"
   );
   // append the new element
   $("#card-" + locationId)
      .find("ol")
      .append(newListElement);
   // append the time if not blank
   if (playerObj.time.length > 0) {
      $(newListElement).append(
         "<span class='player-time'>" + playerObj.time + "</span>"
      );
   }
}

// load localstorage
function loadLocalStorage() {
   // load location data
   var loadedData = JSON.parse(localStorage.getItem("locations"));
   if (loadedData != undefined && loadedData.length > 0) {
      // build cards from loaded data
      loadedData.forEach(function (item) {
         newLocation(item.name, item.info, item.players);
      });
   }

   // load timer data
   var loadedTimer = JSON.parse(localStorage.getItem("timer"));
   if (loadedTimer != undefined) {
      timerObj.time = loadedTimer.time;
      timerObj.active = loadedTimer.active;
      updateTimer();
      // auto click start button if timer is active
      if (timerObj.active === true) {
         $("#timer-start-btn").trigger("click");
      }
   }
}

// create unique ID from name using character codes. used for string sanitization
function uid(str) {
   var newUID = "";
   for (let i = 0; i < str.length; i++) {
      newUID += str.charCodeAt(i);
   }
   return newUID;
}

// save localstorage
function saveLocalStorage(source) {
   var dataToSave = [];
   // loop through all the cards to get the data
   // remember to ignore the hidden dummy card
   $(".card[id]").each(function () {
      // loop through all the list items to get the player data
      var playersList = [];
      $(this)
         .find("li")
         .each(function () {
            // add player array items one at a time
            playersList.push({
               name: $(this).find(".player-name").text(),
               status: $(this).attr("data-status"),
               time: $(this).find(".player-time").text(),
            });
         });
      // add total card data to array
      dataToSave.push({
         name: $(this).find("button").text(),
         info: $(this).find(".accordion-body").text(),
         players: playersList,
      });
   });
   console.log(dataToSave, source);
   localStorage.setItem("locations", JSON.stringify(dataToSave));
   localStorage.setItem("timer", JSON.stringify(timerObj));
}

// format seconds to mm:ss
function formatTime(timeInSeconds) {
   var minutes = Math.floor(timeInSeconds / 60);
   var seconds = Math.floor(timeInSeconds % 60);
   // zero padding
   if (minutes < 10) {
      minutes = "0" + minutes;
   }
   if (seconds < 10) {
      seconds = "0" + seconds;
   }
   return minutes + ":" + seconds;
}

// update the timer display
function updateTimer() {
   $("#timer-text").text(formatTime(timerObj.time));
}

// add location submit listener
$("#location-form").on("submit", function (event) {
   event.preventDefault();
   var newLocationName = $("#location-name-input").val().trim();
   var newLocationInfo = $("#location-info-textarea").val().trim();
   if (newLocationName.length > 0 && newLocationInfo.length > 0) {
      $("#location-name-input").val("");
      $("#location-info-textarea").val("");
      newLocation(newLocationName, newLocationInfo);
   }
   $("#location-name-input").focus();
});

// add player submit listener
$("#player-form").on("submit", function (event) {
   event.preventDefault();
   var newPlayerName = $("#player-name-input").val().trim().toLowerCase();
   // loop through object array to check if name already exists
   $("#card-0")
      .find(".player-name")
      .each(function () {
         if ($(this).text() == newPlayerName) {
            // make string empty and just let the rest of the function continue
            newPlayerName = "";
            // does not stop the entire function when using 'each()'
            return;
         }
      });
   if (newPlayerName.length > 0) {
      appendPlayer(0, {
         name: newPlayerName,
         time: 0,
         status: 0,
      });
      saveLocalStorage("add player: " + newPlayerName);
   }
   $("#player-name-input").val("");
   $("#player-name-input").focus();
});

// edit modal submit listener
$("#modal-form").on("submit", function (event) {
   event.preventDefault();
});

// player name list item mouseover listener. used for player name highlighting
// modified from https://stackoverflow.com/a/9827114
$("#cards-container").on(
   {
      mouseenter: function () {
         mouseOverUID = $(this).attr("data-uid");
         $("li[data-uid='" + mouseOverUID + "']").addClass("player-highlight");
      },
      mouseleave: function () {
         mouseOverUID = $(this).attr("data-uid");
         $("li[data-uid='" + mouseOverUID + "']").removeClass(
            "player-highlight"
         );
      },
   },
   "li"
);

// location name context menu
$("#cards-container").on("contextmenu", "button", function (event) {
   event.preventDefault();
   // get id number of right clicked location. used for context menu actions
   rightClickedLocation = $(event.target)
      .closest("*[data-location]")
      .attr("data-location");
   // get location name at right clicked location. used for context menu actions
   rightClickedName = $(event.target).closest("button").text();
   // hide other context menu
   $("#player-context-menu").addClass("d-none");
   // check if context menu is already open
   if ($("#location-context-menu").hasClass("d-none")) {
      $("#location-context-menu").removeClass("d-none");
      $("#location-context-menu").css("left", event.pageX + "px");
      $("#location-context-menu").css("top", event.pageY + "px");
   } else {
      $("#location-context-menu").addClass("d-none");
   }
});

// player name list item context menu
$("#cards-container").on("contextmenu", "li", function (event) {
   event.preventDefault();
   // get id number of right clicked location. used for context menu actions
   rightClickedLocation = $(event.target)
      .closest("*[data-location]")
      .attr("data-location");
   // get player name at right clicked location. used for context menu actions
   // travels up the DOM tree then searches back down, because why not
   rightClickedName = $(event.target).closest("li").find(".player-name").text();
   // hide other context menu
   $("#location-context-menu").addClass("d-none");
   // check if context menu is already open
   if ($("#player-context-menu").hasClass("d-none")) {
      $("#player-context-menu").removeClass("d-none");
      $("#player-context-menu").css("left", event.pageX + "px");
      $("#player-context-menu").css("top", event.pageY + "px");
   } else {
      $("#player-context-menu").addClass("d-none");
   }
});

// hide context menu when clicking anywhere
$("*").on("click", function () {
   $("#location-context-menu").addClass("d-none");
   $("#player-context-menu").addClass("d-none");
});

// button click listener
$("body").on("click", "button", function (event) {
   var targetElementId = $(event.target).closest("button").attr("id");
   // timer - start
   if (targetElementId === "timer-start-btn") {
      $("#timer-start-btn").toggleClass("d-none");
      $("#timer-stop-btn").toggleClass("d-none");
      timerObj.active = true;
   }
   // timer - stop
   else if (targetElementId === "timer-stop-btn") {
      $("#timer-stop-btn").toggleClass("d-none");
      $("#timer-resume-btn").toggleClass("d-none");
      $("#timer-reset-btn").toggleClass("d-none");
      timerObj.active = false;
   }
   // timer - resume
   else if (targetElementId === "timer-resume-btn") {
      $("#timer-resume-btn").toggleClass("d-none");
      $("#timer-stop-btn").toggleClass("d-none");
      $("#timer-reset-btn").toggleClass("d-none");
      timerObj.active = true;
   }
   // timer - reset
   else if (targetElementId === "timer-reset-btn") {
      $("#timer-reset-btn").toggleClass("d-none");
      $("#timer-start-btn").toggleClass("d-none");
      $("#timer-resume-btn").toggleClass("d-none");
      timerObj.time = 0;
      updateTimer();
   }
   // progress - reset
   else if (targetElementId === "reset-progress-btn") {
      modalTrigger = targetElementId;
      $("#confirm-modal-text").text("Reset all progress?");
   }
   // delete - players
   else if (targetElementId === "delete-players-btn") {
      modalTrigger = targetElementId;
      $("#confirm-modal-text").text("Delete all players?");
   }
   // delete - everything
   else if (targetElementId === "delete-everything-btn") {
      modalTrigger = targetElementId;
      $("#confirm-modal-text").text("Delete everything?");
   }
   // context menu - edit location
   else if (targetElementId === "edit-location-btn") {
      modalTrigger = targetElementId;
      $("#modal-input").val(rightClickedName);
      $("#modal-textarea-form").removeClass("d-none");
      $("#modal-textarea").val(
         $("#card-" + rightClickedLocation)
            .find(".accordion-body")
            .text()
      );
   }
   // context menu - delete location
   else if (targetElementId === "delete-location-btn") {
      modalTrigger = targetElementId;
      $("#confirm-modal-text").text(
         "Delete location '" + rightClickedName + "'?"
      );
   }
   // context menu - edit player
   else if (targetElementId === "edit-player-btn") {
      modalTrigger = targetElementId;
      $("#modal-input").val(rightClickedName);
      $("#modal-textarea-form").addClass("d-none");
   }
   // context menu - undo progress
   else if (targetElementId === "undo-progress-btn") {
      if ($("li[data-uid='" + uid(rightClickedName) + "']").length > 1) {
         // delete last occurence of player item
         $("li[data-uid='" + uid(rightClickedName) + "']")
            .last()
            .remove();
         // remove progress status from next last item
         $("li[data-uid='" + uid(rightClickedName) + "']")
            .last()
            .attr("data-status", "0");
         $("li[data-uid='" + uid(rightClickedName) + "']")
            .last()
            .removeAttr("data-time");
         $("li[data-uid='" + uid(rightClickedName) + "']")
            .last()
            .find("span")
            .last()
            .remove();
      }
   }
   // context menu - delete player
   else if (targetElementId === "delete-player-btn") {
      modalTrigger = targetElementId;
      $("#confirm-modal-text").text(
         "Delete player '" + rightClickedName + "'?"
      );
   }
   // modal - confirmation
   else if (targetElementId === "modal-confirm-btn") {
      // reset progress
      if (modalTrigger === "reset-progress-btn") {
         $("li[data-location!='0']").remove();
         $("li").each(function () {
            $(this).attr("data-status", "0");
         });
         $(".player-time").remove();
      }
      // delete all players
      else if (modalTrigger === "delete-players-btn") {
         $("li").remove();
      }
      // delete everything
      else if (modalTrigger === "delete-everything-btn") {
         $(".card[id]").remove();
      }
      // delete location
      else if (modalTrigger === "delete-location-btn") {
         $("#card-" + rightClickedLocation).remove();
         // reloading page is easier way to fix the remaining locations
         location.reload();
      }
      // delete player
      else if (modalTrigger === "delete-player-btn") {
         $("li[data-uid='" + uid(rightClickedName) + "']").remove();
      }
   }
   // modal - save changes
   else if (targetElementId === "modal-save-button") {
      var newName = $("#modal-input").val().trim();
      var newLocationInfo = $("#modal-textarea").val().trim();
      // save changes - edit location
      if (modalTrigger === "edit-location-btn") {
         // input validation
         // if empty name
         if (newName.length < 1) {
            $("#edit-modal").modal("hide");
            $("#alert-modal").modal("show");
            $("#alert-modal-text").text("Player name cannot be empty.");
         }
         // if empty info
         else if (newLocationInfo.length < 1) {
            $("#edit-modal").modal("hide");
            $("#alert-modal").modal("show");
            $("#alert-modal-text").text(
               "Information and hint cannot be empty."
            );
         }
         // if no changes
         else if (
            newName === rightClickedName &&
            newLocationInfo ===
               $("#card-" + rightClickedLocation)
                  .find(".accordion-body")
                  .text()
         ) {
            return;
         }
         // else no errors found
         else {
            // modify location name
            $("#card-" + rightClickedLocation)
               .find("button")
               .text(newName);
            // modify location info
            $("#card-" + rightClickedLocation)
               .find(".accordion-body")
               .text(newLocationInfo);
         }
      }
      // save changes - edit player
      else if (modalTrigger === "edit-player-btn") {
         // input validation
         // if empty string
         if (newName.length < 1) {
            $("#edit-modal").modal("hide");
            $("#alert-modal").modal("show");
            $("#alert-modal-text").text("Player name cannot be empty.");
         }
         // if no change
         else if (newName === rightClickedName) {
            return;
         }
         // if already exists
         else if ($("li[data-uid='" + uid(newName) + "']").length) {
            $("#edit-modal").modal("hide");
            $("#alert-modal").modal("show");
            $("#alert-modal-text").text("Player name already exists.");
         }
         // else no errors found
         else {
            // only modify the first span element (the one containing the name, not the time)
            $("li[data-uid='" + uid(rightClickedName) + "']")
               .find("span:first")
               .text(newName);
            // modify the uid to new one
            $("li[data-uid='" + uid(rightClickedName) + "']").attr(
               "data-uid",
               uid(newName)
            );
         }
      }
   }
   // modal - error okay
   else if (targetElementId === "modal-okay-btn") {
      $("#alert-modal").modal("hide");
      $("#edit-modal").modal("show");
   }
   saveLocalStorage(targetElementId);
});

// modal input autofocus
$("#edit-modal").on("shown.bs.modal", function () {
   $("#modal-input").focus();
});

// player list item click listener
$("#cards-container").on("click", "li[data-status='0']", function (event) {
   var targetElement = $(event.target).closest("li");
   var clickedName = targetElement.find(".player-name").text();
   var clickedLocation = parseInt(targetElement.attr("data-location"));
   var nextLocation = clickedLocation + 1;
   // update the element
   targetElement.attr("data-status", "1");
   targetElement.attr("data-time", timerObj.time);
   targetElement
      .closest("li")
      .append(
         $("<span class='player-time'>" + formatTime(timerObj.time) + "</span>")
      );
   // check if more progress is available
   if ($(".card").length >= nextLocation) {
      appendPlayer(nextLocation, {
         name: clickedName,
         time: 0,
         status: 0,
      });
   }
   saveLocalStorage("progress: " + clickedName);
});

// auto fit timer text size
$("#timer-text").fitText(0.35);

// timer
setInterval(function () {
   if (timerObj.active) {
      timerObj.time++;
      updateTimer();
      if (timerObj.time % 15 === 0) {
         saveLocalStorage("autosave");
      }
   }
}, 1000);

// load
loadLocalStorage();
