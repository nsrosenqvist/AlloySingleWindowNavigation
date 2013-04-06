// Extend the demo_view controller
exports.baseController = "demo_view";
$.main.add($.content);

$.button.addEventListener("click", function() {
	navigation.open("demo_subview", {title: "Subview"});
});
