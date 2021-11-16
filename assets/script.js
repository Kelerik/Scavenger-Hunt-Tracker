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

// for testing
// clone the first list and apply unique IDs and data-location attributes
for (let i = 1; i < 7; i++) {
    var cloneList = $(".col").last().clone();
    cloneList.find("li").remove();
    cloneList.find(".card").attr("data-location", i);
    cloneList.appendTo(".row");
}
$(".col").each(function (i) {
    $(this)
        .find(".card")
        .attr("id", "card-" + i);
    $(this)
        .find(".accordion-collapse")
        .attr("id", "accordion-panel-" + i);
    $(this)
        .find("button")
        .attr("data-bs-target", "#accordion-panel-" + i);
    $(this)
        .find("button")
        .append(" " + (i + 1));
});

// make each card a droppable target for the dragged elements
$(".card").each(function (i) {
    $(this).droppable({
        // only accept items from the previous list
        accept: ".list-group-item[data-location='" + (i - 1) + "']",
        drop: function (event, ui) {
            // when item is dropped, append a copy of it to the list
            var newListItem = ui.draggable.clone();
            // assign new data-location number
            newListItem.attr("data-location", i);
            // append item to the list
            $(this).find("ol").append(newListItem);
            // make that new item draggable
            makeDraggable(newListItem);
            // make original item no longer draggable
            ui.draggable.draggable("disable");
            ui.draggable.addClass("bg-success text-light");
        },
    });
});

makeDraggable($(".list-group-item"));
