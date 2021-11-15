var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

$(".list-group-item").draggable({
    helper: "clone",
    zIndex: 100,
    revert: "invalid",
    revertDuration: 100,
});
