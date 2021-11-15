// make an object draggable
function makeDraggable(objectParam) {
    objectParam.draggable({
        helper: "clone",
        zIndex: 100,
        revert: "invalid",
        revertDuration: 100,
        start: function (event, ui) {
            console.log(ui.helper);

            $(".card").each(function () {
                // only highlight the next cards, not the current or previous ones
                if (
                    $(this).attr("id").replace("card-", "") >
                    objectParam.closest(".card").attr("id").replace("card-", "")
                ) {
                    $(this).toggleClass("border-light border-success");
                }
            });
        },
        stop: function () {
            $(".card").removeClass("border-success");
            $(".card").addClass("border-light");
        },
    });
}

// clone the first list and apply unique IDs
for (let i = 0; i < 7; i++) {
    var cloneList = $(".col").last().clone();
    cloneList.find("li").remove();
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

// make droppable targets for the dragged elements
$(".card").droppable({
    accept: ".list-group-item",
    drop: function (event, ui) {
        // when item is dropped, append a copy of it to the list
        var newListItem = ui.draggable.clone();
        $(this).find("ol").append(newListItem);
        // make that new item draggable
        makeDraggable(newListItem);
        // make original item no longer draggable
        ui.draggable.draggable("disable");
        ui.draggable.addClass("bg-success text-light");
    },
});
makeDraggable($(".list-group-item"));
