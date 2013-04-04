var navigation = Alloy.Globals.navigation;

$.button.addEventListener("click", function() {
	$.other.visible = true;
	navigation.open(this, {title: "Within same ctrl", view: $.other});
});
