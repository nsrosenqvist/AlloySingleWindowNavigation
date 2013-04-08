// Public properties (use the get/set methods to use them)
$.prop = {};

$.prop.historyStack = new Array();
$.prop.historyStackOptions = new Array();
$.prop.historyLimit = 10;
//$.prop.clearHistoryOnTopLevel = false;
$.prop.index = null;
$.prop.indexOptions = null;
$.prop.defaultOpenTransition = {transition: 'fade', transitionColor: "#fff", duration: 200};
$.prop.defaultBackTransition = {transition: 'fade', transitionColor: "#000", duration: 200};
//$.prop.defaultViewMode = 'fullscreen';
//$.prop.defaultViewDriver = '';
$.prop.confirmOnExit = true;
$.prop.defaultCloseMenu = true;

// Private properties
$.transitionImage = null;
$.transitions = {};
$.confirmedExit = false;
//$.onTransition = [];
$.mainWindow = undefined;
//$.destroyQueue = [];
//$.onOrientationChange = [];
$.previous = {
	controller: undefined,
	options: undefined,
};
$.current = {
	controller: undefined,
	options: undefined,
};

// Internal helper functions
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
	var options = $.merge($.prop.indexOptions, {first: true});
	exports.open($.prop.index, options);
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
exports.open = function(controller, options) {
	exports.fireEvent("openstart");
	
	if ( ! controller) {
		Ti.API.error("Open of view failed, no controller specified");
		return false;
	}
	if ( ! options) {
		options = {};
	}
	
	// Merge transition defaults
	options = $.mergeMissing(options, $.prop.defaultOpenTransition);

	if ( ! options.hasOwnProperty("identifier")) {
		options.identifier = "";
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

	// Set pointers to the current and previous controller
	$.current.controller = controller;
	$.current.options = options;
	
	if ($.prop.historyStack.length > 0) {
		var prevIndex = $.prop.historyStack.length - 1;
		$.previous.controller = $.prop.historyStack[prevIndex];
		$.previous.options = $.prop.historyStackOptions[prevIndex];	
	}
	else {
		$.previous.controller = undefined;
		$.previous.options = undefined;
	}
	
	$.prop.historyStackOptions.push(options);
	$.prop.historyStack.push(controller);

	// Open the resulting controller
	exports.go(null, function() {
		// Purge history
		if ($.prop.historyLimit > 0) {
			exports.clearHistory($.prop.historyLimit);
		}
	});
};

exports.go = function(options, callback) {
	var controller = $.current.controller;
	options = (options) ? $.merge($.current.options, options) : $.current.options;

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
			$.transitions[options.transition](view, options, callback);
			delete action;
		};
	}
	else {
		action = function() {
			$.transitions[$.prop.defaultOpenTransition.transition](view, options, callback);
			delete action;
		};
	}
	
	// Wait for the menu to close (if it's open) before opening new view 
	if (options.closeMenu && exports.menu && exports.menu.isOpen()) {
		Ti.API.info("Transitioning to the new view after the menu has closed...");
		
		// Create a callback for when the menu has closed and delete it within itself so that it doesn't repeat
		var listener = function() {
			action();		
			exports.menu.removeEventListener("closecompleted", listener);
			exports.fireEvent("opencomplete");
			Ti.API.info("New view loaded");
		};
		
		exports.menu.addEventListener("closecompleted", listener);
		exports.menu.close();
	}
	else {
		action();
		exports.fireEvent("opencomplete");
		Ti.API.info("New view loaded");
	}
};

// Navigate back in history
exports.back = function(newOptions) {
	if ( ! newOptions) {
		newOptions = {};
	}

	// If the menu is open we close it instead of navigating back in history
	if (exports.menu && exports.menu.isOpen()) {
		exports.menu.close();
		return true;
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
	else {
		Ti.API.info("Going back in the history stack");
		exports.fireEvent("back");
	}

	// Controller we will show
	$.previous.controller = $.prop.historyStack.pop();
	$.previous.options = $.prop.historyStackOptions.pop();
	
	var curIndex = $.prop.historyStack.length - 1;
	$.current.controller = $.prop.historyStack[curIndex];
	$.current.options = $.prop.historyStackOptions[curIndex];
	
	// If the current view has been opened in some special way
	// and have a unique method for going back, it will be executed
	// instead of the normal transition
	if (newOptions.hasOwnProperty("customBack")) {
		newOptions.customBack();
	}
	else {
		// Merge options
		var options = $.merge($.prop.defaultBackTransition, newOptions);
		exports.go(options, function() {
			$.previous.controller.destroy();
			$.previous.controller = undefined;
			$.previous.options = undefined;
		});
	}
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
$.transitions.crossFade = function(view, options, callback) {
	exports.fireEvent("transitionstart");
	
	if ( ! firstView) {
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

$.transitions.fade = function(view, options, callback) {
	exports.fireEvent("transitionstart");
	
	if ($.previous.controller) {
		Ti.API.info("AAAAAAAAAAA");
		Ti.API.info("HISTORYSTACK: " + $.prop.historyStack.length);
		var transitionColor = (options.transitionColor) ? options.transitionColor : "#000";
		var newView = ($.current.options.hasOwnProperty("view")) ? $.current.options.view : $.current.controller.getView();
		var oldView = ($.previous.options.hasOwnProperty("view")) ? $.previous.options.view : $.previous.controller.getView();
		var oldZIndex = oldView.zIndex;
		
		oldView.zIndex = 9;
	
		// var transitionView = Ti.UI.createView({
			// backgroundColor: transitionColor,
			// height: $.appWrap.height,
			// width: $.appWrap.width,
			// left: 0,
			// top: 0,
			// zIndex: 8,
		// });
	
		// Add new view
		//$.content.add(transitionView);
		$.content.add(newView);
		
		// Fade to new view
		oldView.animate({top: 20, duration: options.duration}, function() {
			$.content.remove(oldView);
			view.top = 100;
			
			if (callback) {
				callback();
			}
			//oldView.zIndex = oldZIndex;
			
			// transitionView.animate({opacity: 0, duration: options.duration}, function() {
				// $.content.remove(transitionView);
				// delete transitionView;
				// exports.fireEvent("transitionend");
			// });
		});
	}
	else {
		Ti.API.info("BBBBBBBBBBBB");
		Ti.API.info("HISTORYSTACK: " + $.prop.historyStack.length);
		view.opacity = 0;
		$.content.add(view);
		view.animate({opacity: 1, duration: options.duration}, function() {
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
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

// Clear the appWrap's content
exports.clearContent = function() {
	for (var child in $.content.children) {
		$.content.remove($.content.children[child]);
	}
};

// Returns true if the historyStack is longer than 1
exports.hasHistory = function() {
	return ($.prop.historyStack.length > 1) ? true : false;
};
// Clear the historyStack. HistoryLimit specifies how many
// steps of the most recent history to keep
exports.clearHistory = function(historyLimit) {
	if (historyLimit) {
		historyLimit = (historyLimit < 1) ? 1 : historyLimit;
	}
	else {
		historyLimit = 1;
	}
	
	if ($.prop.historyStack.length > 1 && historyLimit < $.prop.historyStack.length) {
		for (var i = ($.prop.historyStack.length); i > historyLimit; i--) {
			var oldOptions = $.prop.historyStackOptions.splice((i - 1), 1)[0];
			var oldController = $.prop.historyStack.splice((i - 1), 1)[0];

			// Do not destroy the old controller if there is a specific view specified
			if ( ! oldOptions.view) {
				oldController.destroy();
				delete oldOptions;
				delete oldController;
			} 
		}
	}
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
exports.getPrevious = function() {
	return $.previous;
};
exports.getPreviousController = function() {
	return $.previous.controller;
};
exports.getPreviousOptions = function() {
	return $.previous.options;
};

// A convenience method for retrieving a pointer to the current controller.
// The whole history stack can be retrieved and manipulated through exports.get('historyStack')
exports.getCurrent = function() {
	return $.current;
};
exports.getCurrentController = function() {
	return $.current.controller;
};
exports.getCurrentOptions = function() {
	return $.current.options;
};

// Proxy methods for adding event listeners to the navigation module
exports.addEventListener = function(eventName, action) {
	$.appWrap.addEventListener(eventName, action);
};
exports.removeEventListener = function(eventName, action) {
	$.appWrap.removeEventListener(eventName, action);
};
exports.fireEvent = function(eventName) {
	$.appWrap.fireEvent(eventName);
};