// make an object draggable
function makeDraggable(objectParam) {
    objectParam.draggable({
        helper: "clone",
        zIndex: 100,
        revert: "invalid",
        revertDuration: 100,
    });
}

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
        ui.draggable.addClass("bg-success bg-gradient text-light");
    },
});

makeDraggable($(".list-group-item"));
