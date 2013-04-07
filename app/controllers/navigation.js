// Public properties (use the get/set methods to use them)
$.prop = {};

$.prop.historyStack = new Array();
$.prop.historyStackOptions = new Array();
$.prop.historyLimit = 10;
$.prop.clearHistoryOnTopLevel = false;
$.prop.index = null;
$.prop.indexOptions = null;
$.prop.defaultOpenTransition = {transition: 'fade', transitionColor: "#fff", duration: 200};
$.prop.defaultBackTransition = {transition: 'fade', transitionColor: "#000", duration: 200};
//$.prop.defaultViewMode = 'fullscreen';
$.prop.defaultViewDriver = '';
$.prop.confirmOnExit = true;
$.prop.defaultCloseMenu = true;

// Private properties
$.transitionImage = null;
$.transitions = {};
$.confirmedExit = false;
$.onTransition = [];
$.mainWindow = undefined;
$.onOrientationChange = [];

// Internal helper functions
// $.pixelsToDPUnits = function(pixels) {
	// if (OS_IOS) {
		// return pixels;
	// }
	// else {
		// return (pixels / (Ti.Platform.displayCaps.dpi / 160));
	// }
// }

$.merge = function(mergeInto, mergeFrom) {
	for (var prop in mergeFrom) {
		mergeInto[prop] = mergeFrom[prop];
	}
	return mergeInto;
};

$.mergeMissing = function(mergeInto, mergeFrom) {
	for (var prop in mergeFrom) {
		if ( ! mergeInto.hasOwnProperty(prop)) {
			mergeInto[prop] = mergeFrom[prop];
		}
	}
	return mergeInto;
}

// Init
exports.init = function(args) {
	Ti.API.info("Initializing application...");

	// Set the mainWindow
	if (args.hasOwnProperty("mainWindow")) {
		$.mainWindow = args.mainWindow;
		delete args.mainWindow;
	}
	else {
		$.mainWindow = Ti.UI.createWindow({
			backgroundColor: "#000",
			navBarHidden: true,
			exitOnClose: true,
		});
	}
	
	// Create global display object containing the display dimensions
	// in DP-units to make it easier to work with the platform
	// Alloy.Globals.display = {
		// width: $.pixelsToDPUnits(Ti.Platform.displayCaps.platformWidth),
		// height: $.pixelsToDPUnits(Ti.Platform.displayCaps.platformHeight),
	// };
	// exports.setAppDimensions();
// 		
	// // Update dimensions on orientation changes to get more accurate values instead of displayCaps
	// Ti.Gesture.addEventListener("orientationchange", function(e) {
		// var listener = function() {
			// // Alloy.Globals.display.width = $.mainWindow.size.width;
			// // Alloy.Globals.display.height = $.mainWindow.size.height;
			// // exports.setAppDimensions();
			// //exports.executeOrientationChangeActions();
// 			
			// // if (exports.nav) {
				// // exports.nav.onOrientationChange(e);
			// // }
			// // if (exports.view) {
				// // exports.view.onOrientationChange(e);
			// // }
			// // if (exports.menu) {
				// // exports.menu.onOrientationChange(e);
			// // }
// 	
			// $.mainWindow.removeEventListener("postlayout", listener);
			// delete listener;
		// };
		// $.mainWindow.addEventListener("postlayout", listener);
// 		
		// if ( ! e.quiet) { 
			// Ti.API.info("Device switched orientation");
		// }
	// });
	
	// Fire orientationchange event so that the display object get's updated on postlayout
	//Ti.Gesture.fireEvent("orientationchange", {quiet: true});
	
	// Create the driver if they are set
	// if (args.hasOwnProperty("nav")) {
		// exports.setNavControlsDriver(args.nav);
		// delete args.nav;
	// }
	if (args.hasOwnProperty("menuDriver")) {
		if (exports.setMenuDriver(args.menuDriver)) {
			if (exports.menu.hasOwnProperty("init")) {
				exports.menu.init();
			}
		}
		delete args.menuDriver;
	}
	// if (args.hasOwnProperty("viewDriver")) {
		// exports.setViewDriver(args.viewDriver);
		// delete args.viewDriver;
	// }
// 	
	// Initialize the drivers
	// if (exports.nav) {
		// exports.nav.init();
	// }
	// if (exports.menu) {
		// exports.menu.init();
	// }
	// if (exports.view) {
		// exports.view.init();
	// }
	
	// Set general properties
	for (var option in args) {
		set(option, args[option]);
	}
	
	// Android specific
	if (OS_ANDROID) {
		if (args.bindMenu) {
			exports.bindMenu();
		}
		exports.bindBack();
	}
	
	// Add the navigation controller content to the mainWindow
	$.mainWindow.add($.getView());
	$.mainWindow.open();

	// Open the index/default/welcome view
	exports.open($.prop.index, $.prop.indexOptions);
	Ti.API.info("Application initialization complete");
};

// exports.addOrientationChangeAction = function(action) {
	// if ( ! action) {
		// $.onOrientationChange.push(action);
		// return true;
	// }
	// else {
		// return false;
	// }
// };
// exports.executeOrientationChangeActions = function() {
	// if ($.onOrientationChange.length > 0) {
		// for (var action in $.onOrientationChange) {
			// action();
		// }
	// }
// };
// exports.addTransitionAction = function(action) {
	// if ( ! action) {
		// $.onTransition.push(action);
		// return true;
	// }
	// else {
		// return false;
	// }
// };
// exports.executeTransitionActions = function() {
	// if ($.onTransition.length > 0) {
		// for (var action in $.onTransition) {
			// action();
		// }
	// }
// };

// General getter/setter
var get = exports.get = function(property) {
	if ($.prop.hasOwnProperty(property)) {
		return $.prop[property];
	}
	else {
		return undefined;
	}
};
var set = exports.set = function(property, value) {
	$.prop[property] = value;
};

// Place holder for the menu driver
exports.menu = null;

exports.setMenuDriver = function(controller) {
	if (typeof controller == "string") {
		try {
			exports.menu = Alloy.createController(controller);
		}
		catch (error) {
			Ti.API.error("Error occurred when creating menu driver: " + error);
			return false;
		}
	}
	else {
		if (controller) {
			exports.menu = controller;
		}
	}
	
	return true;
};
exports.getMenuDriver = function() {
	return exports.menu;
};

// Place holder for the navigation controls driver
// exports.nav = null;
// 
// exports.setNavControlsDriver = function(controller) {
	// if (typeof controller == "string") {
		// try {
			// exports.nav = Alloy.createController(controller);
		// }
		// catch (error) {
			// Ti.API.error("Error occurred when creating navigation controls driver: " + error);
			// return false;
		// }
	// }
	// else {
		// if (controller) {
			// exports.nav = controller;
		// }
	// }
// };
// exports.getNavControlsDriver = function() {
	// return exports.nav;
// };

// Place holder for the navigation controls driver
// exports.view = null;
// 
// exports.setViewDriver = function(controller) {
	// if (typeof controller == "string") {
		// try {
			// exports.view = Alloy.createController(controller);
		// }
		// catch (error) {
			// Ti.API.error("Error occurred when creating navigation controls driver: " + error);
			// return false;
		// }
	// }
	// else {
		// if (controller) {
			// exports.view = controller;
		// }
	// }
// };
// exports.getViewDriver = function() {
	// return exports.view;
// };

// Get a pointer to the mainWindow
exports.getMainWindow = function() {
	return $.mainWindow;
};

// Method for updating the app's dimensions because
// it's easier to work with set values than percentages
// exports.setAppDimensions = function() {
	// $.appWrap.width = Alloy.Globals.display.width;
	// $.appWrap.height = Alloy.Globals.display.height;
// };

// Open a controller's view
exports.open = function(controller, options /* Also toplevel (boolean) */) {
	if ( ! controller) {
		Ti.API.error("Open of view failed, no controller specified");
		return false;
	}
	
	// Create an image of the current view that can be used to animate transitions
	exports.fireEvent("openstart");
	
	// Parse options
	if (typeof options == "boolean") {
		options = {};
		options.topLevel = options;
	}
	if ( ! options) {
		options = {};
	}
	
	// Merge transition defaults
	options = $.mergeMissing(options, $.prop.defaultOpenTransition);
	
	if ( ! options.hasOwnProperty("identifier")) {
		options.identifier = "";
	}
	if ( ! options.hasOwnProperty("topLevel")) {
		options.topLevel = false;
	}
	if ( ! options.hasOwnProperty("affectHistory")) {
		options.affectHistory = true;
	}
	if ( ! options.hasOwnProperty("closeMenu")) {
		options.closeMenu = $.prop.defaultCloseMenu;
	}
	
	// Create controller and the view we're going to show
	if (typeof controller == "string") {
		Ti.API.info("Opening controller: " + controller + ", Options: " + JSON.stringify(options));
		controller = Alloy.createController(controller, options);
	}
	else {
		Ti.API.info("Opening unknown controller view. Options: " + JSON.stringify(options));
	}

	// If a view hasn't been provided we show the controllers associated view 
	var view = null;
	
	if ( ! options.hasOwnProperty("view")) {
		Ti.API.info("Preparing the view related to the specified controller...");
		
		if (controller.hasOwnProperty("init")) {
			Ti.API.info("Executing the controller's init method...");
			controller.init();
		}
		
		view = controller.getView();
	}
	else {
		Ti.API.info("Navigating within the same controller");
		view = options.view;
	}

	// This variable will hold the function which will perform the transition
	var action = null;
	
	// If the specified transition exists we use it, otherwise we use the defaultTransition
	if (exports.hasTransition(options.transition)) {
		action = function() {
			$.transitions[options.transition](view, options);
			delete action;
		};
	}
	else {
		action = function() {
			$.transitions[$.prop.defaultOpenTransition.transition](view, options);
			delete action;
		};
	}
	
	// Is this opening of a controller's view supposed to affect the historyStack?
	if (options.affectHistory) {
		if ($.prop.clearHistoryOnTopLevel && options.topLevel) {
			Ti.API.info("Top level view opened, clearing all controller history");
			exports.clearHistory();
		}
		else {
			if ($.prop.historyLimit !== null) {
				exports.clearHistory($.prop.historyLimit);
			}
		}
		
		$.prop.historyStackOptions.push(options);
		$.prop.historyStack.push(controller);
	}
	else {
		Ti.API.info("Opening view without affecting history");
	}
	
	// Wait for the menu to close (if it's open) before opening new view 
	if (options.closeMenu && exports.menu && exports.menu.isOpen()) {
		Ti.API.info("Transitioning to the new view after the menu has closed...");
		
		// Create a callback for when the menu has closed and delete it within itself so that it doesn't repeat
		var listener = function() {
			action();
			$.transitionImage = null;
			exports.menu.removeEventListener("closecompleted", listener);
			exports.fireEvent("opencomplete");
			Ti.API.info("New view loaded");
		};
		
		exports.menu.addEventListener("closecompleted", listener);
		exports.menu.close();
	}
	else {
		action();
		$.transitionImage = null;
		exports.fireEvent("opencomplete");
		Ti.API.info("New view loaded");
	}
	
	return true;
};

// Navigate back in history with functionality for specifying
// the number of steps to go back in history
exports.back = function(steps, newOptions) {
	if (typeof steps != "number") {
		steps = 1;
	}
	if ( ! newOptions) {
		newOptions = {};
	}

	// If the menu is open we close it instead of navigating back in history
	if (exports.menu && exports.menu.isOpen()) {
		exports.menu.close();
		return true;
	}
	
	// Prevent trying to go further back in history than what's possible
	if (steps > $.prop.historyStack.length -1) {
		steps = $.prop.historyStack.length -1;
	}
	
	// Close app if we've gone to the very end of history
	if ($.prop.historyStack.length <= 1) {
		// Confirm exit
		if (OS_ANDROID && $.prop.confirmOnExit && ! $.confirmedExit) {
			$.confirmedExit = true;
			Ti.API.info("At end of historyStack, showing exit confirmation message");
			
			var toast = Ti.UI.createNotification({
				message: "Press back again to exit",
				duration: Ti.UI.NOTIFICATION_DURATION_SHORT,
			}).show();
			
			// reset confirmation
			setTimeout(function() {
				$.confirmedExit = false;
			}, 2500);
			
			return true;
		}
		else {
			Ti.API.info("At end of historyStack, closing application");
			exports.exit();
			return true;
		}
	} 

	exports.fireEvent("back");
	Ti.API.info("Navigating back in history " + steps + " steps...");

	// Controller we will show
	var controller = null;
	var options = null;
	
	for (var i = 0; i < steps + 1; i++) {
		options = $.prop.historyStackOptions.pop();
		controller = $.prop.historyStack.pop();
	}

	// Parse options
	if ( ! options) {
		options = {};	
	}
	
	// Merge default transition
	options = $.merge(options, $.prop.defaultBackTransition);
	
	Ti.API.info("Transition: " + options.transition);
	
	// Set topLevel property
	if ( ! options.hasOwnProperty("topLevel")) {
		options.topLevel = ( ! exports.hasHistory()) ? true : false;
	}
	
	// Open the resulting controller with the stored options merged with the new options
	options = $.merge(options, newOptions);
	exports.open(controller, options);
};

// Transition related methods and some transition presets
exports.addTransition = function(name, action) {
	$.transitions[name] = action;
};
exports.hasTransition = function(name) {
	if ( ! name) {
		return false;
	}
	
	for (var transition in $.transitions) {
		if (transition.toLowerCase() == name.toLowerCase()) {
			return true;
		}
	}
	return false;
};

// Transition presets
$.transitions.crossFade = function(view, options) {
	exports.fireEvent("transitionstart");
	
	if (exports.hasHistory()) {
		var oldController = exports.getPreviousController();
		var oldOptions = exports.getPreviousControllerOptions();
		var oldView = (oldOptions.hasOwnProperty("view")) ? oldOptions.view : oldController.getView();
		var oldZIndex = oldView.zIndex;
		
		oldView.zIndex = 9;
		$.content.add(view);
		
		// Fade to new view
		oldView.animate({opacity: 0, duration: options.duration}, function() {
			$.content.remove(oldView);
			oldView.zIndex = oldZIndex;
			exports.fireEvent("transitionend");
		});
	}
	else {
		view.opacity = 0;
		$.content.add(view);
		view.animate({opacity: 1, duration: options.duration}, function() {
			exports.fireEvent("transitionend");
		});
	}
};

$.transitions.fade = function(view, options) {
	exports.fireEvent("transitionstart");
	
	if (exports.hasHistory()) {
		var transitionColor = (options.transitionColor) ? options.transitionColor : "#000";	
		var oldController = exports.getPreviousController();
		var oldOptions = exports.getPreviousControllerOptions();
		var oldView = (oldOptions.hasOwnProperty("view")) ? oldOptions.view : oldController.getView();
		var oldZIndex = oldView.zIndex;
		
		oldView.zIndex = 9;
	
		var transitionView = Ti.UI.createView({
			backgroundColor: transitionColor,
			height: $.appWrap.height,
			width: $.appWrap.width,
			left: 0,
			top: 0,
			zIndex: 8,
		});
	
		// Add new view
		$.content.add(transitionView);
		$.content.add(view);
		
		// Fade to new view
		oldView.animate({opacity: 0, duration: options.duration}, function() {
			$.content.remove(oldView);
			oldView.zIndex = oldZIndex;
			
			transitionView.animate({opacity: 0, duration: options.duration}, function() {
				$.content.remove(transitionView);
				delete transitionView;
				exports.fireEvent("transitionend");
			});
		});
	}
	else {
		view.opacity = 0;
		$.content.add(view);
		view.animate({opacity: 1, duration: options.duration}, function() {
			exports.fireEvent("transitionend");
		});
	}
};

$.transitions.slideInFromRight = function(view, options) {
	exports.fireEvent("transitionstart");
	
	if (exports.hasHistory()) {
		var oldController = exports.getPreviousController();
		var oldOptions = exports.getPreviousControllerOptions();
		var oldView = (oldOptions.hasOwnProperty("view")) ? oldOptions.view : oldController.getView();
	
		// Set the view out of sight before switching it's contents
		view.left = $.mainWindow.size.width;
		$.content.add(view);
	
		// Slide in view
		view.animate({left: 0, duration: options.duration});
		
		oldView.animate({left: -$.mainWindow.size.width, duration: options.duration}, function() {
			$.content.remove(oldView);
			exports.fireEvent("transitionend");
		});
	}
	else {
		view.left = $.mainWindow.size.width;
		$.content.add(view);
		view.animate({left: 0, duration: options.duration}, function() {
			exports.fireEvent("transitionend");
		});
	}
};

$.transitions.slideInFromLeft = function(view, options) {
	exports.fireEvent("transitionstart");
	
	if (exports.hasHistory()) {
		var oldController = exports.getPreviousController();
		var oldOptions = exports.getPreviousControllerOptions();
		var oldView = (oldOptions.hasOwnProperty("view")) ? oldOptions.view : oldController.getView();
		
		// Set the view out of sight before switching it's contents
		view.left = -$.mainWindow.size.width;
		$.content.add(view);
		
		// Slide in view
		view.animate({left: 0, duration: options.duration});
		
		oldView.animate({left: $.mainWindow.size.width, duration: options.duration}, function() {
			$.content.remove(oldView);
			exports.fireEvent("transitionend");
		});
	}
	else {
		view.left = -$.mainWindow.size.width;
		$.content.add(view);
		view.animate({left: 0, duration: options.duration}, function() {
			exports.fireEvent("transitionend");
		});
	}
};
// 
// $.transitions.basic = function(view, options) {
	// exports.fireEvent("transitionstart");
	// // Set old view above new one so that we can switch out it's contents without flickering
	// // var transitionImage = Ti.UI.createImageView({
		// // image: $.transitionImage,
		// // height: $.appWrap.height,
		// // width: $.appWrap.width,
		// // left: 0,
		// // top: 0,
		// // zIndex: 9,
	// // });
// 	
	// // Set the view out of sight before switching it's contents
	// //$.mainWindow.add(transitionImage);
	// $.mainWindow.add(view)
	// exports.clearContent();
	// $.content.add(view);
// 	
	// // Adjust the navControls if a driver exists
	// // if (exports.nav) {
		// // exports.nav.onTransition(options);
	// // }
	// if (exports.menu) {
		// exports.menu.onTransition(options);
	// }
// 	
	// // Show new view
	// $.mainWindow.remove(transitionImage);
	// delete transitionImage;
	// exports.fireEvent("transitionend");
// };

$.transitions.none = function(view, options) {
	exports.fireEvent("transitionstart");
	
	if (exports.hasHistory()) {
		var oldController = exports.getPreviousController();
		var oldOptions = exports.getPreviousControllerOptions();
		var oldView = (oldOptions.hasOwnProperty("view")) ? oldOptions.view : oldController.getView();
		
		$.content.add(view);
		$.content.remove(oldView);
		
		exports.fireEvent("transitionend");
	}
	else {
		$.content.add(view);
		exports.fireEvent("transitionend");
	}
};

// Clear the current view's content
exports.clearContent = function() {
	for (var child in $.content.children) {
		$.content.remove($.content.children[child]);
	}
};
exports.removePreviousView = function() {
	var prevController = exports.getPreviousController();
	var prevOptions = exports.getPreviousControllerOptions();
	
	if (prevOptions.hasOwnProperty("view")) {
		$.mainWindow.content.remove(prevOptions.view);
	}
	else {
		$.mainWindow.content.remove(prevController.getView());
	}
};

// Clear the historyStack. HistoryLimit specifies how many
// steps of the most recent history to keep
exports.clearHistory = function(historyLimit) {
	historyLimit = (historyLimit) ? historyLimit : 0;
	
	for (var i = ($.prop.historyStack.length); i > historyLimit; i--) {
		var oldOptions = $.prop.historyStackOptions.pop();
		var oldController = $.prop.historyStack.pop();
		
		// Do not destroy the old controller if there is a specific view specified
		if ( ! oldOptions.view) {
			oldController.destroy();
		}
	}
};
exports.hasHistory = function() {
	return ($.prop.historyStack.length > 1) ? true : false;
};

// Bind Android hardware menu button
exports.bindMenu = function() {
	$.mainWindow.activity.onPrepareOptionsMenu = function(e) {
		exports.menu.toggle();
	};
};
exports.releaseBindMenu = function() {
	$.mainWindow.activity.onPrepareOptionsMenu = function(e) {};
};

// Bind Android hardware back button
exports.bindBack = function() {
	$.mainWindow.addEventListener("androidback", exports.back);
};
exports.releaseBindBack = function() {
	$.mainWindow.removeEventListener("androidback", exports.back);
};

// A convenience method for closing the application
exports.exit = function() {
	$.mainWindow.close();
};

// A convenience method for retrieving a pointer to the previous controller.
// The whole history stack can be retrieved and manipulated through exports.get('historyStack')
exports.getPreviousController = function() {
	var length = $.prop.historyStack.length;
	
	if (length > 1) {
		return $.prop.historyStack[length - 2];
	}
	else {
		return undefined;
	}
};
exports.getPreviousControllerOptions = function() {
	var length = $.prop.historyStackOptions.length;
	
	if (length > 1) {
		return $.prop.historyStackOptions[length - 2];
	}
	else {
		return undefined;
	}
};

// A convenience method for retrieving a pointer to the current controller.
// The whole history stack can be retrieved and manipulated through exports.get('historyStack')
exports.getCurrentController = function() {
	var length = $.prop.historyStack.length;
	
	if (length > 0) {
		return $.prop.historyStack[length - 1];
	}
	else {
		return undefined;
	}
};
exports.getCurrentControllerOptions = function() {
	var length = $.prop.historyStackOptions.length;
	
	if (length > 0) {
		return $.prop.historyStackOptions[length - 1];
	}
	else {
		return undefined;
	}
};

exports.addEventListener = function(eventName, action) {
	$.appWrap.addEventListener(eventName, action);
};
exports.removeEventListener = function(eventName, action) {
	$.appWrap.removeEventListener(eventName, action);
};
exports.fireEvent = function(eventName) {
	$.appWrap.fireEvent(eventName);
};