var locationsArray = [];

// clone the first card and apply new ID number and data-location number
function newLocation(locationName, locationInfo) {
   // add to array
   locationsArray.push({ name: locationName, info: locationInfo });
   // get new number
   var newId = locationsArray.length;
   // clone the dummy card and edit appropriate attributes
   var cloneCard = $(".card-wrapper").first().clone();
   cloneCard.removeClass("d-none");
   cloneCard.find(".card").attr("data-location", newId);
   cloneCard.appendTo(".cards-container");
   cloneCard.find(".card").attr("id", "card-" + newId);
   cloneCard.find(".accordion-collapse").attr("id", "accordion-panel-" + newId);
   cloneCard.find("button").attr("data-bs-target", "#accordion-panel-" + newId);
   cloneCard.find("button").text(newId + ". " + locationName);
   cloneCard.find(".accordion-body").text(locationInfo);
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
         $(this).find("ol").append(newListItem);
         // make it draggable
         makeDraggable(newListItem);
         // make original item no longer draggable
         ui.draggable.draggable("disable");
         ui.draggable.addClass("bg-secondary text-light");
      },
   });
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

// add location button listener
$("#add-location-btn").on("click", function () {
   var newLocationName = $("#location-name-input").val();
   var newLocationInfo = $("#location-info-input").val();
   if (newLocationName.length > 0 && newLocationInfo.length > 0) {
      newLocation(newLocationName, newLocationInfo);
   }
});

// add player button listener
$("#add-player-btn").on("click", function () {
   var newPlayerName = $("#player-name-input").val();
   var newPlayerElement = $(
      '<li class="list-group-item" data-location="1">' + newPlayerName + "</li>"
   );
   if (newPlayerName.length > 0) {
      $("#card-1").find("ol").append(newPlayerElement);
      makeDraggable(newPlayerElement);
   }
});
