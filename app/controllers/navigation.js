// Public properties (use the get/set methods to use them)
$.prop = {};

$.prop.historyStack = new Array();
$.prop.historyStackOptions = new Array();
$.prop.historyLimit = 10;
$.prop.index = null;
$.prop.indexOptions = null;
$.prop.defaultOpenTransition = {transition: 'none', transitionColor: "#fff", duration: 150};
$.prop.defaultBackTransition = {transition: 'none', transitionColor: "#000", duration: 150};
$.prop.confirmOnExit = true;
$.prop.defaultCloseMenu = true;

// Private properties
$.transitions = {};
$.confirmedExit = false;
$.mainWindow = undefined;
$.previous = {
	controller: undefined,
	options: undefined,
	view: undefined,
};
$.current = {
	controller: undefined,
	options: undefined,
	view: undefined,
};

// Internal helper functions
$.merge = function(mergeInto, mergeFrom) {
	var newObj = {};
	for (var prop in mergeInto) {
		newObj[prop] = mergeInto[prop];
	}
	for (var prop in mergeFrom) {
		newObj[prop] = mergeFrom[prop];
	}
	return newObj;
};
$.mergeMissing = function(mergeInto, mergeFrom) {
	var newObj = {};
	for (var prop in mergeInto) {
		newObj[prop] = mergeInto[prop];
	}
	for (var prop in mergeFrom) {
		if ( ! newObj.hasOwnProperty(prop)) {
			newObj[prop] = mergeFrom[prop];
		}
	}
	return newObj;
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
	
	// Create the menuDriver if it's been set
	if (args.hasOwnProperty("menuDriver")) {
		if (exports.setMenuDriver(args.menuDriver)) {
			if (exports.menu.hasOwnProperty("init")) {
				exports.menu.init();
			}
		}
		delete args.menuDriver;
	}
	
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
	exports.home();
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
	
	return true;
};
exports.getMenuDriver = function() {
	return exports.menu;
};

// Get a pointer to the mainWindow
exports.getMainWindow = function() {
	return $.mainWindow;
};

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
		controller.init();
	}
	else {
		Ti.API.info("Opening unknown controller view. Options: " + JSON.stringify(options));
	}

	// Set pointers to the current and previous controller
	$.current.controller = controller;
	$.current.options = options;
	$.current.view = (options.hasOwnProperty("view")) ? options.view : $.current.controller.getView();
	
	if ($.prop.historyStack.length > 0) {
		var prevIndex = $.prop.historyStack.length - 1;
		$.previous.controller = $.prop.historyStack[prevIndex];
		$.previous.options = $.prop.historyStackOptions[prevIndex];
		$.previous.view = ($.previous.options.hasOwnProperty("view")) ? $.previous.options.view : $.previous.controller.getView();
	}
	else {
		$.previous.controller = undefined;
		$.previous.options = undefined;
		$.previous.view = undefined;
	}
	
	$.prop.historyStackOptions.push(options);
	$.prop.historyStack.push(controller);
	
	// If a custom open function has been provided we use it instead
	if (options.hasOwnProperty("customOpen")) {
		options.customOpen(options, function() {
			if ($.prop.historyLimit > 0) {
				exports.clearHistory($.prop.historyLimit);
			}
		});
	}
	else {
		// Open the resulting controller
		exports.go($.current.view, options, function() {
			if ($.prop.historyLimit > 0) {
				exports.clearHistory($.prop.historyLimit);
			}
		});
	}
};

// Method for executing a transition, the history changes should be done in the
// code calling this method (like in exports.open and exports.back)
exports.go = function(view, options, callback) {
	// This variable will hold the function which will perform the transition
	var action = null;
	
	if ( ! view) {
		Ti.API.error("No view has been specified, nothing to transition to");
		return false;
	}
	
	// If the specified transition exists we use it, otherwise we use the defaultTransition
	if (exports.hasTransition(options.transition)) {
		action = function() {
			$.transitions[options.transition](view, $.previous.view, options, callback);
			delete action;
		};
	}
	else {
		action = function() {
			$.transitions[$.prop.defaultOpenTransition.transition](view, $.previous.view, options, callback);
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

	// Controller we will transition from
	$.previous.controller = $.prop.historyStack.pop();
	$.previous.options = $.prop.historyStackOptions.pop();
	$.previous.view = ($.previous.options.hasOwnProperty("view")) ? $.previous.options.view : $.previous.controller.getView();
	
	// Controller we will go to (one step back in history since we popped the array for $.previous)
	var curIndex = $.prop.historyStack.length - 1;
	$.current.controller = $.prop.historyStack[curIndex];
	$.current.options = $.prop.historyStackOptions[curIndex];
	$.current.view = ($.current.options.hasOwnProperty("view")) ? $.current.options.view : $.current.controller.getView();
	
	// Merge options
	var options = $.merge($.current.options, $.prop.defaultBackTransition);
	options = $.merge(options, newOptions);
	
	// If the current view has been opened in some special way
	// and have a unique method for going back, it will be executed
	// instead of the normal transition
	if (newOptions.hasOwnProperty("customBack")) {
		newOptions.customBack(options, function() {
			$.previous.controller.destroy();
			$.previous.controller = undefined;
			$.previous.options = undefined;
			$.previous.view = undefined;
		});
	}
	else {	
		exports.go($.current.view, options, function() {
			$.previous.controller.destroy();
			$.previous.controller = undefined;
			$.previous.options = undefined;
			$.previous.view = undefined;
		});
	}
};

// Convenience method for opening the index view
exports.home = function(options) {
	if (options) {
		options = $.merge($.prop.indexOptions, options);
	}
	else {
		options = $.prop.indexOptions;
	}
	
	exports.open($.prop.index, options);
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
$.transitions.crossFade = function(newView, previousView, options, callback) {
	exports.fireEvent("transitionstart");
	
	if (previousView) {
		var oldZIndex = previousView.zIndex;
		
		previousView.zIndex = 9;
		$.content.add(newView);
		
		// Fade to new view
		previousView.animate({opacity: 0, duration: options.duration}, function() {
			$.content.remove(previousView);
			previousView.opacity = 1;
			previousView.zIndex = oldZIndex;
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
		});
	}
	else {
		newView.opacity = 0;
		$.content.add(newView);
		newView.animate({opacity: 1, duration: options.duration}, function() {
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
		});
	}
};

$.transitions.fade = function(currentView, previousView, options, callback) {
	exports.fireEvent("transitionstart");
	
	if (previousView) {
		var transitionColor = (options.transitionColor) ? options.transitionColor : "#000";
		var oldZIndex = previousView.zIndex;
		
		previousView.zIndex = 9;
	
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
		$.content.add(currentView);
		
		// Fade to new view
		previousView.animate({opacity: 0, duration: options.duration}, function() {
			$.content.remove(previousView);
			previousView.opacity = 1;
			previousView.zIndex = oldZIndex;
			
			transitionView.animate({opacity: 0, duration: options.duration}, function() {
				$.content.remove(transitionView);
				delete transitionView;
				exports.fireEvent("transitionend");
				
				if (callback) {
					callback();
				}
			});
		});
	}
	else {
		currentView.opacity = 0;
		$.content.add(currentView);
		
		currentView.animate({opacity: 1, duration: options.duration}, function() {
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
		});
	}
};

$.transitions.slideInFromRight = function(newView, previousView, options, callback) {
	exports.fireEvent("transitionstart");
	
	if (previousView) {	
		// Set the view out of sight before switching it's contents
		newView.left = $.mainWindow.size.width;
		$.content.add(newView);
	
		// Slide in view
		newView.animate({left: 0, duration: options.duration}, function() {
			newView.left = 0;
		});
		
		previousView.animate({left: -$.mainWindow.size.width, duration: options.duration}, function() {
			$.content.remove(previousView);
			previousView.left = 0;
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
		});
	}
	else {
		newView.left = $.mainWindow.size.width;
		$.content.add(newView);
		
		newView.animate({left: 0, duration: options.duration}, function() {
			newView.left = 0;
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
		});
	}
};

$.transitions.slideInFromLeft = function(newView, previousView, options, callback) {
	exports.fireEvent("transitionstart");
	
	if (previousView) {
		// Set the view out of sight before switching it's contents
		newView.left = -$.mainWindow.size.width;
		$.content.add(newView);
		
		// Slide in view
		newView.animate({left: 0, duration: options.duration}, function() {
			newView.left = 0;
		});
		
		previousView.animate({left: $.mainWindow.size.width, duration: options.duration}, function() {
			$.content.remove(previousView);
			previousView.left = 0;
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
		});
	}
	else {
		newView.left = -$.mainWindow.size.width;
		$.content.add(newView);
		
		newView.animate({left: 0, duration: options.duration}, function() {
			newView.left = 0;
			exports.fireEvent("transitionend");
			
			if (callback) {
				callback();
			}
		});
	}
};

$.transitions.none = function(newView, previousView, options, callback) {
	exports.fireEvent("transitionstart");
	
	if (previousView) {
		$.content.add(newView);
		$.content.remove(previousView);
		exports.fireEvent("transitionend");
	}
	else {
		$.content.add(newView);
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
		while ($.prop.historyStack.length > historyLimit) {
			var oldController = $.prop.historyStack.shift();
			var oldOptions = $.prop.historyStackOptions.shift();
			
			// Do not destroy the old controller if there is a specific view specified
			if ( ! oldOptions.view) {
				oldController.destroy();
				delete oldController;
			} 
			
			delete oldOptions;
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
exports.getPreviousView = function() {
	return $.previous.view;
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
exports.getCurrentView = function() {
	return $.current.view;
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