var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();
var menu = null;

// Init the controller here, also set the reference to the menu driver
// here since it doesn't exist until init is run
exports.init = function() {
	menu = navigation.getMenuDriver();

};

// This method is executed during the transition of on view to another.
// Here you can alter the view's components before it's presented to the user
exports.onTransition = function(options) {

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
