var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();
var navCtrl = null;

// Init the controller here, also set the reference to the navigation controls
// driver here since it doesn't exist until init is run
exports.init = function() {
	navCtrl = navigation.getNavControlsDriver();

};

// Method for toggling the visibility of the menu
// It should fire the event "toggle"
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

// This method is executed during the transition of on view to another.
// Here you can alter the view's components before it's presented to the user
exports.onTransition = function() {
	
};

// This method is executed when an orientationchange is triggered.
// This solution is more reliable on Android than just hooking up to Ti.Gesture->orientationchange
exports.onOrientationChange = function() {
	
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