// timer
var timer = 0;
var timerActive = false;
// global variable containing all the data
var locationsArray = [];

// create new location card and apply new ID number and data-location number
function newLocation(locationName, locationInfo, locationPlayers) {
   // add to array
   locationsArray.push({
      name: locationName,
      info: locationInfo,
      players: [],
   });
   // get new number
   var newId = locationsArray.length - 1;
   // clone the dummy card and edit appropriate attributes
   var cloneCard = $(".card-wrapper").first().clone();
   cloneCard.removeClass("d-none");
   cloneCard.find(".card").attr("data-location", newId);
   cloneCard.appendTo("#cards-container");
   cloneCard.find(".card").attr("id", "card-" + newId);
   cloneCard.find(".accordion-collapse").attr("id", "accordion-panel-" + newId);
   cloneCard.find("button").attr("data-bs-target", "#accordion-panel-" + newId);
   cloneCard.find("button").text(newId + 1 + ". " + locationName);
   cloneCard.find(".accordion-body").text(locationInfo);
   // add player(s) to list (if argument passed)
   if (locationPlayers != undefined) {
      locationPlayers.forEach(function (item) {
         appendPlayer(newId, item);
      });
   }
}

// append player list item
function appendPlayer(locationId, playerName) {
   // add to array
   locationsArray[locationId].players.push(playerName);
   // create new element with appropriate attributes
   var newPlayerElement = $(
      '<li class="list-group-item" data-uid="' +
         // must convert into a number to avoid certain characters breaking code
         createUID(playerName) +
         '" data-status="pending" data-location="' +
         locationId +
         '">' +
         playerName +
         "</li>"
   );
   // append element
   $("#card-" + locationId)
      .find("ol")
      .append(newPlayerElement);
}

// load localstorage
function loadLocalStorage() {
   // load location data
   var loadedData = JSON.parse(localStorage.getItem("savedScavengerHuntData"));
   if (loadedData != undefined) {
      // build cards from loaded data
      loadedData.forEach(function (item) {
         newLocation(item.name, item.info, item.players);
      });
      // run through all players and fix their statuses
      // first location has all the players. use that list to get all the names
      locationsArray[0].players.forEach(function (item) {
         var searchUID = createUID(item);
         // apply to all instances of the player
         $("li[data-uid='" + searchUID + "']").attr(
            "data-status",
            "progressed"
         );
         $("li[data-uid='" + searchUID + "']").addClass("progressed");
         // then change the last one back to pending
         $("li[data-uid='" + searchUID + "']")
            .last()
            .removeClass("progressed");
         $("li[data-uid='" + searchUID + "']")
            .last()
            .attr("data-status", "pending");
      });
   }

   // load timer data
   var loadedTimer = JSON.parse(localStorage.getItem("timer"));
   if (loadedTimer != undefined) {
      timer = loadedTimer;
   }
}

// save localstorage
function saveLocalStorage() {
   localStorage.setItem(
      "savedScavengerHuntData",
      JSON.stringify(locationsArray)
   );
   localStorage.setItem("timer", JSON.stringify(timer));
}

// delete all players
function deletePlayers() {
   locationsArray.forEach(function (item) {
      item.players = [];
   });
   saveLocalStorage();
   location.reload();
}

// delete everything
function deleteEverything() {
   locationsArray = [];
   saveLocalStorage();
   location.reload();
}

// create unique ID from string using character codes. used for string sanitization
function createUID(string) {
   var newUID = "";
   for (let i = 0; i < string.length; i++) {
      newUID += string.charCodeAt(i);
   }
   return newUID;
}

// update the timer display
function updateTimer() {
   var minutes = Math.floor(timer / 60);
   var seconds = Math.floor(timer % 60);
   // zero padding
   if (minutes < 10) {
      minutes = "0" + minutes;
   }
   if (seconds < 10) {
      seconds = "0" + seconds;
   }
   $("#timer-text").text(minutes + ":" + seconds);
}

// add location submit listener
$("#location-form").on("submit", function (event) {
   event.preventDefault();
   var newLocationName = $("#location-name-input").val().trim();
   $("#location-name-input").val("");
   $("#location-name-input").trigger("focus");
   var newLocationInfo = $("#location-info-input").val().trim();
   $("#location-info-input").val("");
   if (newLocationName.length > 0 && newLocationInfo.length > 0) {
      newLocation(newLocationName, newLocationInfo);
      saveLocalStorage();
   }
});

// add player submit listener
$("#player-form").on("submit", function (event) {
   event.preventDefault();
   var newPlayerName = $("#player-name-input").val().trim();
   $("#player-name-input").val("");
   $("#player-name-input").trigger("focus");
   if (newPlayerName.length > 0) {
      appendPlayer(0, newPlayerName);
      saveLocalStorage();
   }
});

// delete buttons click listener
$("#delete-buttons").on("click", "button", function (event) {
   if ($(event.target).id("id") === "delete-players-btn") {
      deletePlayers();
   } else if ($(event.target).attr("id") === "delete-everything-btn") {
      deleteEverything();
   }
});

// player name list item click listener
$("#cards-container").on(
   "click",
   "li[data-status='pending']",
   function (event) {
      var clickedName = $(event.target).text();
      var nextLocation = parseInt($(event.target).attr("data-location")) + 1;
      $(event.target).attr("data-status", "progressed");
      $(event.target).addClass("progressed");
      // check if more progress is available
      if (locationsArray.length > nextLocation) {
         appendPlayer(nextLocation, clickedName);
         saveLocalStorage();
      }
   }
);

// timer buttons click listener
$("#timer-buttons").on("click", "button", function (event) {
   if ($(event.target).attr("id") === "timer-start-btn") {
      timer = 0;
      timerActive = true;
   } else if ($(event.target).attr("id") === "timer-stop-btn") {
      timerActive = false;
   }
});

// auto fit timer text size
$("#timer-text").fitText(0.35);

// timer
setInterval(function () {
   if (timerActive) {
      timer++;
      updateTimer();
   }
}, 1000);

// load
loadLocalStorage();
