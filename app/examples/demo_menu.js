var navigation = Alloy.Globals.navigation;
var mainWindow = undefined;

$.menuOpen = false;

exports.init = function() {
	mainWindow = navigation.getMainWindow();
	mainWindow.add($.menuWrap);
	
	if (OS_IOS) {
		$.menu.remove($.buttonExit);
	}
	if (OS_ANDROID) {
		// Bind android HW-Menu button
		exports.bindMenu();
		
		// Override android HW-back behaviour
		navigation.releaseBack();
		mainWindow.addEventListener("androidback", function(e) {
			if ($.menuOpen) {
				exports.close();
			}
			else {
				navigation.back();
			}
		});
	}
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
	
exports.open = function(callback) {
	if ( ! $.menuOpen) {
		Ti.API.info("Opening menu");
		$.menuOpen = true;
		exports.fireEvent("openstart");
		
		// Set the width of the menu
		var newMenuWidth = mainWindow.size.width - 70;
		$.menu.width = (newMenuWidth > $.menu.width) ? $.menu.width : newMenuWidth;	

		// Show menu
		navigation.appWrap.animate({left: $.menu.width, duration: 150, curve: Ti.UI.ANIMATION_CURVE_EASE_OUT}, function() {
			exports.fireEvent("opencompleted");
			
			if (callback) {
				callback();
			}
		});
	}
	else {
		Ti.API.info("Attempted to open the menu when it was already open");
	}
};
	
exports.close = function(callback) {
	if ($.menuOpen) {
		Ti.API.info("Closing menu");
		exports.fireEvent("closestart");
		
		// hide menu
		navigation.appWrap.animate({left: 0, duration: 150, curve: Ti.UI.ANIMATION_CURVE_EASE_OUT}, function() {
			$.menuOpen = false;
			exports.fireEvent("closecompleted");
			
			if (callback) {
				callback();
			}
		});
	}
	else {
		Ti.API.info("Attempted to close the menu when it was already closed");
	}
};

exports.isOpen = function() {
	return $.menuOpen;
};

// Bind Android hardware menu button
exports.bindMenu = function() {
	mainWindow.activity.onPrepareOptionsMenu = function(e) {
		exports.toggle();
	};
};
exports.releaseMenu = function() {
	mainWindow.activity.onPrepareOptionsMenu = function(e) {};
};

// Proxy methods for events
exports.addEventListener = function(eventName, action) {
	$.menuWrap.addEventListener(eventName, action);
};
exports.removeEventListener = function(eventName, action) {
	$.menuWrap.removeEventListener(eventName, action);
};
exports.fireEvent = function(eventName) {
	$.menuWrap.fireEvent(eventName);
};

// Enable closing of menu by clicking the content when it's open
exports.addEventListener("opencompleted", function(){
	navigation.appWrap.addEventListener("click", exports.close);
});
exports.addEventListener("closestart", function(){
	navigation.appWrap.removeEventListener("click", exports.close);
});

// Buttons
$.go = function(identifier, controller, options) {
	var id = navigation.getCurrentOptions().identifier || "";
	
	if (id != identifier) {
		exports.close(function() {
			navigation.open(controller, options);
		});
	}
	else {
		exports.close();
	}
};

$.buttonIndex.addEventListener("click", function(e) {
	$.go('index', navigation.get('index'), navigation.get('indexOptions'));
});
$.buttonTopLevel.addEventListener("click", function(e) {
	$.go('topview', 'demo_topview', {title: 'Topview', topLevel: true, identifier: 'topview'});
});
$.buttonExit.addEventListener("click", function(e) {
	navigation.exit();
});

