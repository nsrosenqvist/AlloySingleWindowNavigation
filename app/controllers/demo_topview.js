var navigation = Alloy.Globals.navigation;

$.button.addEventListener("click", function() {
	navigation.open("demo_subview", {title: "Subview"});
});