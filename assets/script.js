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
function appendPlayer(locationId, playerObj) {
   // add to array
   locationsArray[locationId].players.push(playerObj);
   // create new element with appropriate attributes
   var newListElement = $(
      '<li class="list-group-item" data-uid="' +
         // must convert into a number to avoid certain characters breaking code
         playerObj.uid +
         '" data-status="' +
         playerObj.status +
         '" data-location="' +
         locationId +
         '">' +
         playerObj.name +
         "</li>"
   );
   // append the new element
   $("#card-" + locationId)
      .find("ol")
      .append(newListElement);
   // append the time to that element if higher than 0
   if (playerObj.time > 0) {
      $(newListElement).append(
         $(
            "<span class='player-time'>" +
               formatTime(playerObj.time) +
               "</span>"
         )
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
      timer = loadedTimer;
      updateTimer();
   }
}

// save localstorage
function saveLocalStorage() {
   localStorage.setItem("locations", JSON.stringify(locationsArray));
   localStorage.setItem("timer", JSON.stringify(timer));
}

// create unique ID from string using character codes. used for string sanitization
function createUID(string) {
   var newUID = "";
   for (let i = 0; i < string.length; i++) {
      newUID += string.charCodeAt(i);
   }
   return newUID;
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
   $("#timer-text").text(formatTime(timer));
}

// add location submit listener
$("#location-form").on("submit", function (event) {
   event.preventDefault();
   var newLocationName = $("#location-name-input").val().trim();
   var newLocationInfo = $("#location-info-input").val().trim();
   if (newLocationName.length > 0 && newLocationInfo.length > 0) {
      $("#location-name-input").val("");
      $("#location-info-input").val("");
      newLocation(newLocationName, newLocationInfo);
      saveLocalStorage();
   }
   $("#location-name-input").trigger("focus");
});

// add player submit listener
$("#player-form").on("submit", function (event) {
   event.preventDefault();
   var newPlayerName = $("#player-name-input").val().trim();
   if (newPlayerName.length > 0) {
      $("#player-name-input").val("");
      appendPlayer(0, {
         name: newPlayerName,
         time: 0,
         uid: createUID(newPlayerName),
         status: 0,
      });
      saveLocalStorage();
   }
   $("#player-name-input").trigger("focus");
});

// delete buttons click listener
$("#delete-buttons").on("click", function (event) {
   // check if the <span> element was clicked. if so, change the target element to its parent button
   var targetElementId = $(event.target).attr("id");
   if ($(event.target).is("span")) {
      targetElementId = $(event.target).parent().attr("id");
   }
   if (targetElementId === "delete-players-btn") {
      locationsArray.forEach(function (item) {
         item.players = [];
      });
   } else if (targetElementId === "delete-everything-btn") {
      locationsArray = [];
   }
   saveLocalStorage();
   location.reload();
});

// player name list item click listener
$("#cards-container").on("click", "li[data-status='0']", function (event) {
   var clickedName = $(event.target).text();
   var clickedLocation = parseInt($(event.target).attr("data-location"));
   var nextLocation = clickedLocation + 1;
   // loop through object array until finding a match
   locationsArray[clickedLocation].players.forEach(function (item) {
      if (item.name === clickedName) {
         // update the array
         item.status = 1;
         item.time = timer;
         return;
      }
   });
   // update the element
   $(event.target).attr("data-status", "1");
   $(event.target).attr("data-time", timer);
   $(event.target).append(
      $("<span class='player-time'>" + formatTime(timer) + "</span>")
   );
   // check if more progress is available
   if (locationsArray.length > nextLocation) {
      appendPlayer(nextLocation, {
         name: clickedName,
         time: 0,
         uid: createUID(clickedName),
         status: 0,
      });
   }
   saveLocalStorage();
});

// timer buttons click listener
$("#timer-buttons").on("click", function (event) {
   // check if the <span> element was clicked. if so, change the target element to its parent button
   var targetElementId = $(event.target).attr("id");
   if ($(event.target).is("span")) {
      targetElementId = $(event.target).parent().attr("id");
   }
   // check which button was clicked
   if (targetElementId === "timer-start-btn") {
      $("#timer-start-btn").toggleClass("d-none");
      $("#timer-stop-btn").toggleClass("d-none");
      timerActive = true;
   } else if (targetElementId === "timer-stop-btn") {
      $("#timer-stop-btn").toggleClass("d-none");
      $("#timer-resume-btn").toggleClass("d-none");
      $("#timer-reset-btn").toggleClass("d-none");
      timerActive = false;
   } else if (targetElementId === "timer-resume-btn") {
      $("#timer-resume-btn").toggleClass("d-none");
      $("#timer-stop-btn").toggleClass("d-none");
      $("#timer-reset-btn").toggleClass("d-none");
      timerActive = true;
   } else if (targetElementId === "timer-reset-btn") {
      $("#timer-reset-btn").toggleClass("d-none");
      $("#timer-start-btn").toggleClass("d-none");
      $("#timer-resume-btn").toggleClass("d-none");
      timer = 0;
      updateTimer();
   }
   saveLocalStorage();
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
