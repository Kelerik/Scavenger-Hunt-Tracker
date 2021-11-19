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
         $("li[data-uid='" + searchUID + "']").addClass("bg-success");
         // then change the last one back to pending
         $("li[data-uid='" + searchUID + "']")
            .last()
            .removeClass("bg-success");
         $("li[data-uid='" + searchUID + "']")
            .last()
            .attr("data-status", "pending");
      });
   }
}

// save localstorage
function saveLocalStorage() {
   localStorage.setItem(
      "savedScavengerHuntData",
      JSON.stringify(locationsArray)
   );
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

// create unique ID from string
function createUID(string) {
   var newUID = "";
   for (let i = 0; i < string.length; i++) {
      newUID += string.charCodeAt(i);
   }
   return newUID;
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

// delete buttons listener
$("#delete-buttons").on("click", function (event) {
   if ($(event.target).attr("data-delete") === "players") {
      deletePlayers();
   } else if ($(event.target).attr("data-delete") === "everything") {
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
      $(event.target).addClass("bg-success");
      // check if more progress is available
      if (locationsArray.length > nextLocation) {
         appendPlayer(nextLocation, clickedName);
         saveLocalStorage();
      }
   }
);

// load
loadLocalStorage();
