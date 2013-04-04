// Public properties (use the get/set methods to use them)
$.prop = {};

$.prop.historyStack = new Array();
$.prop.historyStackOptions = new Array();
$.prop.historyLimit = 10;
$.prop.index = null;
$.prop.indexOptions = null;
$.prop.defaultOpenTransition = {transition: 'fade', transitionColor: "#fff", duration: 200};
$.prop.defaultBackTransition = {transition: 'fade', transitionColor: "#000", duration: 200};
$.prop.defaultViewMode = 'fullscreen';
$.prop.confirmOnExit = true;

// Private properties
$.transitionImage = null;
$.transitions = {};
$.confirmedExit = false;

// Internal helper functions
$.pixelsToDPUnits = function(pixels) {
	if (OS_IOS) {
		return pixels;
	}
	else {
		return (pixels / (Ti.Platform.displayCaps.dpi / 160));
	}
}

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
		exports.setMainWindow(args.mainWindow);
		delete args.mainWindow;
	}
	else {
		exports.setMainWindow(Ti.UI.createWindow({
			backgroundColor: "#000",
			navBarHidden: true,
			exitOnClose: true,
		}));
	}
	
	// Create global display object containing the display dimensions
	// in DP-units to make it easier to work with the platform
	Alloy.Globals.display = {
		width: $.pixelsToDPUnits(Ti.Platform.displayCaps.platformWidth),
		height: $.pixelsToDPUnits(Ti.Platform.displayCaps.platformHeight),
	};
	exports.setAppDimensions();
		
	// Update dimensions on orientation changes to get more accurate values instead of displayCaps
	Ti.Gesture.addEventListener("orientationchange", function(e) {
		var listener = function() {
			Alloy.Globals.display.width = exports.mainWindow.size.width;
			Alloy.Globals.display.height = exports.mainWindow.size.height;
			exports.setAppDimensions();
			
			if (exports.nav) {
				exports.nav.onOrientationChange(e);
			}
			
			if (exports.menu) {
				exports.menu.onOrientationChange(e);
			}
	
			exports.mainWindow.removeEventListener("postlayout", listener);
			delete listener;
		};
		exports.mainWindow.addEventListener("postlayout", listener);
		
		if ( ! e.quiet) { 
			Ti.API.info("Device switched orientation");
		}
	});
	
	// Fire orientationchange event so that the display object get's updated on postlayout
	Ti.Gesture.fireEvent("orientationchange", {quiet: true});
	
	// Create navigation controls
	if (args.hasOwnProperty("nav")) {
		exports.setNavControlsDriver(args.nav);
		delete args.nav;
	}
	
	// Create the menu
	if (args.hasOwnProperty("menu")) {
		exports.setMenuDriver(args.menu);
		delete args.menu;
	}
	
	// Initialize the components
	if (exports.nav) {
		exports.nav.init();
	}
	if (exports.menu) {
		exports.menu.init();
	}
	
	// General properties
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
	exports.mainWindow.add($.getView());
	exports.mainWindow.open();

	// Open the index/default/welcome view
	exports.open($.prop.index, $.prop.indexOptions);
	Ti.API.info("Application initialization complete");
};

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
};
exports.getMenuDriver = function() {
	return exports.menu;
};

// Place holder for the navigation controls driver
exports.nav = null;

exports.setNavControlsDriver = function(controller) {
	if (typeof controller == "string") {
		try {
			exports.nav = Alloy.createController(controller);
		}
		catch (error) {
			Ti.API.error("Error occurred when creating navigation controls driver: " + error);
			return false;
		}
	}
	else {
		if (controller) {
			exports.nav = controller;
		}
	}
};
exports.getNavControlsDriver = function() {
	return exports.nav;
};

// Place holder for the main window
exports.mainWindow = null;

exports.setMainWindow = function(win) {
	exports.mainWindow = win;
};
exports.getMainWindow = function() {
	return exports.mainWindow;
};

exports.setAppDimensions = function() {
	$.appWrap.width = Alloy.Globals.display.width;
	$.appWrap.height = Alloy.Globals.display.height;
};

exports.open = function(controller, options /* Also toplevel (boolean) */, recordHistory) {
	if ( ! controller) {
		Ti.API.error("Open of view failed, no controller specified");
		return false;
	}
	
	// Create an image of the current view that can be used to animate transitions
	$.transitionImage = $.appWrap.toImage();
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
	
	if ( ! options.hasOwnProperty("title")) {
		options.title = "";
	}
	if ( ! options.hasOwnProperty("identifier")) {
		options.identifier = "";
	}
	if ( ! options.hasOwnProperty("topLevel")) {
		options.topLevel = false;
	}
	if ( ! options.hasOwnProperty("viewMode")) {
		options.viewMode = $.prop.defaultViewMode;
	}
	if (typeof recordHistory != "boolean") {
		recordHistory = true;
	}
	
	// Create controller and the view we're going to show
	if (typeof controller == "string") {
		Ti.API.info("Opening controller view: " + controller + ", Options: " + JSON.stringify(options));
		controller = Alloy.createController(controller);
	}
	else {
		Ti.API.info("Opening unknown controller view. Options: " + JSON.stringify(options));
	}

	// If a view hasn't been provided we show the controllers associated view 
	if ( ! options.hasOwnProperty("view")) {
		options.view = controller.getView();
	}
	else {
		Ti.API.info("Navigating within the same controller");
	}

	var action = null;
	
	// If the specified transition exists we use it, otherwise we use the defaultTransition
	if (exports.hasTransition(options.transition)) {
		action = function() {
			$.transitions[options.transition](options.view, options);
			delete action;
		};
	}
	else {
		action = function() {
			$.transitions[$.prop.defaultOpenTransition.transition](options.view, options);
			delete action;
		};
	}
	
	// Is this opening of a controller's view supposed to affect the historyStack?
	if (recordHistory) {
		// Since iOS apps' navigation is often hierarchical we treat it's history differently
		if (OS_IOS) {
			// topLevel is an option that only is relevant to iOS
			if (options.topLevel) {
				Ti.API.info("Top level view opened, clearing all controller history");
				exports.clearHistory();
				Ti.API.info($.prop.historyStack.length);
			}

			$.prop.historyStackOptions.push(options);
			$.prop.historyStack.push(controller);
		}
		else {
			$.prop.historyStackOptions.push(options);
			$.prop.historyStack.push(controller);
		
			// Clear history but keep the specified number of controllers in history
			if ($.prop.historyLimit !== null) {
				exports.clearHistory($.prop.historyLimit);
			}
		}
	}
	
	// Wait for the menu to close (if it's open) before opening new view 
	if (exports.menu && exports.menu.isOpen()) {
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

exports.back = function(steps, newOptions) {
	if (typeof steps != "number") {
		steps = 1;
	}
	if ( ! newOptions) {
		newOptions = {};
	}
	
	// Close app if we've gone to the very end of history
	if ($.prop.historyStack.length <= 1) {
		// Confirm exit
		if (OS_ANDROID && $.prop.confirmOnExit && ! $.confirmedExit) {
			$.confirmedExit = true;
			
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
			exports.exit();
			return true;
		}
	} 
	
	// Prevent trying to go further back in history than what's possible
	if (steps > $.prop.historyStack.length) {
		steps = $.prop.historyStack.length;
	}
	
	// If the menu is open we close it instead of navigating back in history
	if (exports.menu && exports.menu.isOpen()) {
		exports.menu.close();
		return true;
	}
	
	if ( ! exports.hasHistory) {
		Ti.API.error("Attempting to go back in history when there is no history available");
		return false;
	}
	else {	
		exports.fireEvent("back");
		Ti.API.info("Navigating back in history " + steps + " steps...");
	}

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
	
	// Set iOS-topLevel property
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
	var transitionImage = Ti.UI.createImageView({
		image: $.transitionImage,
		height: $.appWrap.height,
		width: $.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 9,
	});
	
	// Add new view
	exports.mainWindow.add(transitionImage);
	exports.clearContent();
	$.content.add(view);
	
	// Adjust the navControls if a driver exists
	if (exports.nav) {
		exports.nav.onTransition(options);
	}
	if (exports.menu) {
		exports.menu.onTransition(options);
	}
	
	// Fade to new view
	transitionImage.animate({opacity: 0, duration: options.duration}, function() {
		exports.mainWindow.remove(transitionImage);
		delete transitionImage;
		exports.fireEvent("transitionend");
	});
};

$.transitions.fade = function(view, options) {
	exports.fireEvent("transitionstart");
	var transitionColor = (options.transitionColor) ? options.transitionColor : "#000";
	
	var transitionImage = Ti.UI.createImageView({
		image: $.transitionImage,
		height: $.appWrap.height,
		width: $.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 9,
	});

	var transitionView = Ti.UI.createView({
		backgroundColor: transitionColor,
		height: $.appWrap.height,
		width: $.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 8,
	});

	// Add new view
	exports.mainWindow.add(transitionImage);
	exports.mainWindow.add(transitionView);
	exports.clearContent();
	$.content.add(view);
	
	// Adjust the navControls if a driver exists
	if (exports.nav) {
		exports.nav.onTransition(options);
	}
	if (exports.menu) {
		exports.menu.onTransition(options);
	}
	
	// Fade to new view
	transitionImage.animate({opacity: 0, duration: options.duration}, function() {
		exports.mainWindow.remove(transitionImage);
		delete transitionImage;
		
		transitionView.animate({opacity: 0, duration: options.duration}, function() {
			exports.mainWindow.remove(transitionView);
			delete transitionView;
			exports.fireEvent("transitionend");
		});
	});
};

$.transitions.slideInFromRight = function(view, options) {
	exports.fireEvent("transitionstart");
	var transitionImage = Ti.UI.createImageView({
		image: $.transitionImage,
		height: $.appWrap.height,
		width: $.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 9,
	});

	// Set the view out of sight before switching it's contents
	exports.mainWindow.add(transitionImage);
	$.appWrap.left = Alloy.Globals.display.width;
	exports.clearContent();
	$.content.add(view);
	
	// Adjust the navControls if a driver exists
	if (exports.nav) {
		exports.nav.onTransition(options);
	}
	if (exports.menu) {
		exports.menu.onTransition(options);
	}
	
	// Slide in view
	$.appWrap.animate({left: 0, duration: options.duration});
	transitionImage.animate({
		left: -Alloy.Globals.display.width,
		duration: options.duration,
	}, function() {
		exports.mainWindow.remove(transitionImage);
		delete transitionImage;
		exports.fireEvent("transitionend");
	});
};

$.transitions.slideInFromLeft = function(view, options) {
	exports.fireEvent("transitionstart");
	var transitionImage = Ti.UI.createImageView({
		image: $.transitionImage,
		height: $.appWrap.height,
		width: $.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 9,
	});

	// Set the view out of sight before switching it's contents
	exports.mainWindow.add(transitionImage);
	$.appWrap.left = -Alloy.Globals.display.width;
	exports.clearContent();
	$.content.add(view);
	
	// Adjust the navControls if a driver exists
	if (exports.nav) {
		exports.nav.onTransition(options);
	}
	if (exports.menu) {
		exports.menu.onTransition(options);
	}
	
	// Slide in view
	$.appWrap.animate({left: 0, duration: options.duration});
	transitionImage.animate({
		left: Alloy.Globals.display.width,
		duration: options.duration,
	}, function() {
		exports.mainWindow.remove(transitionImage);
		delete transitionImage;
		exports.fireEvent("transitionend");
	});
};

$.transitions.basic = function(view, options) {
	exports.fireEvent("transitionstart");
	// Set old view above new one so that we can switch out it's contents without flickering
	var transitionImage = Ti.UI.createImageView({
		image: $.transitionImage,
		height: $.appWrap.height,
		width: $.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 9,
	});
	
	// Set the view out of sight before switching it's contents
	//exports.mainWindow.add(transitionImage);
	exports.clearContent();
	$.content.add(view);
	
	// Adjust the navControls if a driver exists
	if (exports.nav) {
		exports.nav.onTransition(options);
	}
	if (exports.menu) {
		exports.menu.onTransition(options);
	}
	
	// Show new view
	exports.mainWindow.remove(transitionImage);
	delete transitionImage;
	exports.fireEvent("transitionend");
};

$.transitions.none = function(view, options) {
	exports.fireEvent("transitionstart");
	exports.clearContent();
	$.content.add(view);
	
	// Adjust the navControls if a driver exists
	if (exports.nav) {
		exports.nav.onTransition(options);
	}
	if (exports.menu) {
		exports.menu.onTransition(options);
	}
	
	exports.fireEvent("transitionend");
};

exports.clearContent = function() {
	for (var child in $.content.children) {
		$.content.remove($.content.children[child]);
	}
};

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
	exports.mainWindow.activity.onPrepareOptionsMenu = function(e) {
		exports.menu.toggle();
	};
};
exports.unBindMenu = function() {
	exports.mainWindow.activity.onPrepareOptionsMenu = function(e) {};
};

// Bind Android hardware back button
exports.bindBack = function() {
	exports.mainWindow.addEventListener("androidback", exports.back);
};
exports.unBindBack = function() {
	exports.mainWindow.removeEventListener("androidback", exports.back);
};

exports.exit = function() {
	exports.mainWindow.close();
};

exports.getCurrentViewIdentifier = function() {
	var length = $.prop.historyStackOptions.length;
	
	if (length > 0) {
		return $.prop.historyStackOptions[length - 1].identifier;
	}
	else {
		return undefined;
	}
};

exports.isCurrentViewTopLevel = function() {
	var length = $.prop.historyStackOptions.length;
	
	if (length > 0) {
		return $.prop.historyStackOptions[length - 1].topLevel;
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
