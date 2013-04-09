var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();

// Init the controller here
exports.init = function() {

};

// Method for toggling the visibility of the menu
// It should fire the event "toggle" and subsequently "open" or "close"
exports.toggle = function() {
	exports.fireEvent("toggle");

};

// Method for opening the menu
// It should fire the events "openstart" and "opencompleted"
//
// If the menu opens with an animation the opencompleted event should
// probably be fired at the end of it's animation callback
exports.open = function() {
	exports.fireEvent("openstart");

	exports.fireEvent("opencompleted");
};

// Method for closing the menu
// It should fire the events "closestart" and "closecompleted"
//
// If the menu closes with an animation the closecompleted event should
// probably be fired at the end of it's animation callback
exports.close = function() {
	exports.fireEvent("closestart");

	exports.fireEvent("closecompleted");
};

// Method that should return a boolean on whether the menu is open or closed
exports.isOpen = function() {

};

// Proxy method for the main/wrapper element of this controller
exports.addEventListener = function(eventName, action) {

};
// Proxy method for the main/wrapper element of this controller
exports.removeEventListener = function(eventName, action) {

};
// Proxy method for the main/wrapper element of this controller
exports.fireEvent = function(eventName) {

};