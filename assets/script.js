var locationsArray = [];

// clone the first card and apply new ID number and data-location number
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
   cloneCard.appendTo(".cards-container");
   cloneCard.find(".card").attr("id", "card-" + newId);
   cloneCard.find(".accordion-collapse").attr("id", "accordion-panel-" + newId);
   cloneCard.find("button").attr("data-bs-target", "#accordion-panel-" + newId);
   cloneCard.find("button").text(newId + 1 + ". " + locationName);
   cloneCard.find(".accordion-body").text(locationInfo);
   // add player(s) to list
   if (locationPlayers != undefined) {
      locationPlayers.forEach(function (item) {
         appendPlayer(newId, item);
      });
   }

   // make new card a droppable target. this needs to be run every time a new card is added
   cloneCard.droppable({
      // only accept items from the previous list
      accept: ".list-group-item[data-location='" + (newId - 1) + "']",
      drop: function (event, ui) {
         // when item is dropped, create a copy of it
         var newListItem = ui.draggable.clone();
         // assign new data-location number
         newListItem.attr("data-location", newId);
         // append it to the list
         locationsArray[newId].players.push(newListItem.text());
         $(this).find("ol").append(newListItem);
         // make it draggable
         makeDraggable(newListItem);
         // make original item no longer draggable
         ui.draggable.draggable("disable");
         ui.draggable.addClass("bg-secondary text-light");
         // save
         saveLocalStorage();
      },
   });
}

function appendPlayer(locationId, playerName) {
   locationsArray[locationId].players.push(playerName);
   var newPlayerElement = $(
      '<li class="list-group-item" data-location="' +
         locationId +
         '">' +
         playerName +
         "</li>"
   );
   $("#card-" + locationId)
      .find("ol")
      .append(newPlayerElement);
   makeDraggable(newPlayerElement);
}

// make an object draggable
// we assume this function is only ever used on list items inside the cards
function makeDraggable(objectParam) {
   objectParam.draggable({
      helper: "clone",
      zIndex: 100,
      revert: "invalid",
      revertDuration: 100,
      start: function () {
         // get the number of the next location
         var nextLocation = parseInt($(this).attr("data-location")) + 1;
         // then highlight it
         $(".card[data-location='" + nextLocation + "']").toggleClass(
            "border-light border-success"
         );
      },
      stop: function () {
         $(".card").removeClass("border-success");
         $(".card").addClass("border-light");
      },
   });
}

// load localstorage
function loadLocalStorage() {
   var loadedData = JSON.parse(localStorage.getItem("savedScavengerHuntData"));
   if (loadedData != undefined) {
      loadedData.forEach(function (item) {
         newLocation(item.name, item.info, item.players);
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

// add location button listener
$("#add-location-btn").on("click", function () {
   var newLocationName = $("#location-name-input").val();
   $("#location-name-input").val("");
   $("#location-name-input").trigger("focus");
   var newLocationInfo = $("#location-info-input").val();
   $("#location-info-input").val("");
   if (newLocationName.length > 0 && newLocationInfo.length > 0) {
      newLocation(newLocationName, newLocationInfo);
      saveLocalStorage();
   }
});

// add player button listener
$("#add-player-btn").on("click", function () {
   var newPlayerName = $("#player-name-input").val();
   $("#player-name-input").val("");
   $("#player-name-input").trigger("focus");
   if (newPlayerName.length > 0) {
      appendPlayer(0, newPlayerName);
      saveLocalStorage();
   }
});

// load
loadLocalStorage();
