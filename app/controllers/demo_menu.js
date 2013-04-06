var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();

$.menuOpen = false;

exports.init = function() {
	// Calculate menu width
	var newMenuWidth = Alloy.Globals.display.width - 70;
	$.menuWrap.width = (newMenuWidth > $.menu.width) ? $.menu.width : newMenuWidth;
	
	mainWindow.add($.menuWrap);
};

exports.toggle = function() {
	exports.fireEvent("toggle");
	Ti.API.info("Toggling menu");
	
	if ($.menuOpen) {
		exports.close();
	}
	else {
		exports.open();
	}
};
	
exports.open = function() {
	if ( ! $.menuOpen) {
		Ti.API.info("Opening menu");
		$.menuOpen = true;
		exports.fireEvent("openstart");

		// Show menu
		navigation.appWrap.animate({left: $.menuWrap.width, duration: 150, curve: Ti.UI.ANIMATION_CURVE_EASE_OUT}, function() {
			exports.fireEvent("opencompleted");
		});
	}
	else {
		Ti.API.info("Attempted to open the menu when it was already open");
	}
};
	
exports.close = function() {
	if ($.menuOpen) {
		Ti.API.info("Closing menu");
		exports.fireEvent("closestart");
		
		// hide menu
		navigation.appWrap.animate({left: 0, duration: 150, curve: Ti.UI.ANIMATION_CURVE_EASE_OUT}, function() {
			$.menuOpen = false;
			exports.fireEvent("closecompleted");
		});
	}
	else {
		Ti.API.info("Attempted to close the menu when it was already closed");
	}
};

exports.onOrientationChange = function() {
	
};

exports.onTransition = function() {
	
};

// Proxy method for the main/wrapper element of this controller
exports.addEventListener = function(eventName, action) {
	$.menuWrap.addEventListener(eventName, action);
};

// Proxy method for the main/wrapper element of this controller
exports.removeEventListener = function(eventName, action) {
	$.menuWrap.removeEventListener(eventName, action);
};

// Proxy method for the main/wrapper element of this controller
exports.fireEvent = function(eventName) {
	$.menuWrap.fireEvent(eventName);
};

// Method that should return a boolean on whether the menu is open or closed
exports.isOpen = function() {
	return $.menuOpen;
};

// Enable closing of menu by clicking the content when it's open
exports.addEventListener("opencompleted", function(){
	navigation.appWrap.addEventListener("click", exports.close);
});

// Disable closing of menu by clicking the content when it's hidden
exports.addEventListener("closestart", function(){
	navigation.appWrap.removeEventListener("click", exports.close);
});

// Buttons
$.buttonIndex.addEventListener("click", function(e) {
	if (navigation.getCurrentControllerOptions().identifier != 'index') {
		navigation.open(navigation.get('index'), navigation.get('indexOptions'));
	}
	else {
		exports.close();
	}
});
$.buttonTopLevel.addEventListener("click", function(e) {
	if (navigation.getCurrentControllerOptions().identifier != 'topview') {
		navigation.open("demo_topview", {title: 'Topview', topLevel: true, identifier: 'topview'});
	}
	else {
		exports.close();
	}
});
$.buttonExit.addEventListener("click", function(e) {
	navigation.exit();
});

