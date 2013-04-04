var navigation = Alloy.Globals.navigation;

$.button.addEventListener("click", function() {
	navigation.open("subview", {title: "Open subview"});
});