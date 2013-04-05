var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();
var navCtrl = null;

$.menuOpen = false;

$.sliding = {
	offset: 0,
	center: 0,
	thresholds: {
		slide: Alloy.Globals.display.width * 0.2,
		open: Alloy.Globals.display.width * 0.4,
		stop: $.menu.width,
	},
	touchstart: function(e) {
		Ti.API.info("touchstart: " + JSON.stringify(e));
		$.sliding.offset = e.x - (Alloy.Globals.display.width / 2);
		$.sliding.center = navigation.appWrap.rect.x + (Alloy.Globals.display.width / 2);
		$.sliding.thresholds.slide = Alloy.Globals.display.width * 0.2;
		$.sliding.thresholds.open = Alloy.Globals.display.width * 0.4;
		$.sliding.thresholds.stop = $.menu.width;
	},
	touchmove: function(e) {
		Ti.API.info("touchmove: " + JSON.stringify(e));

		var delta_x = e.x - $.sliding.offset + navigation.appWrap.rect.x;
		delta_x -= (Alloy.Globals.display.width / 2);

        if (delta_x > $.sliding.thresholds.slide) {
            if (delta_x >= $.sliding.thresholds.stop) {
                return;
            }
            else {
            	exports.fireEvent("sliding", {distance: delta_x});
            }

            navigation.appWrap.animate({left: delta_x, duration: 0});
        }
	},
	touchend: function(e) {
		Ti.API.info('touchend: ' + JSON.stringify(e));
		
		var delta_x = e.x - $.sliding.offset + navigation.appWrap.rect.x ;
		delta_x -= (Alloy.Globals.display.width / 2);

		if (delta_x > $.sliding.thresholds.open) {
			exports.open();
		}
		else {
			exports.close();
		}
		
		exports.fireEvent("slidingend");
   },
};

exports.init = function() {
	navCtrl = navigation.getNavControlsDriver();
	
	// Calculate margin needed for button
	var buttonWidth = navCtrl.buttonMenu.width;
	buttonWidth += (navCtrl.buttonMenu.left) ? navCtrl.buttonMenu.left : 0;
	buttonWidth += (navCtrl.buttonMenu.right) ? navCtrl.buttonMenu.right : 0;
	
	// Calculate menu width
	var newMenuWidth = Alloy.Globals.display.width - buttonWidth;
	$.menuWrap.width = (newMenuWidth > $.menu.width) ? $.menu.width : newMenuWidth;
	
	mainWindow.add($.menuWrap);
	
	// TODO: Enable this when Titanium is less buggy when it comes to animations and events
	// Make the menu open when sliding the content view
	//exports.bindOpenOnSlide();
};

exports.bindOpenOnSlide = function() {
	navigation.appWrap.addEventListener("touchstart", $.sliding.touchstart);
	navigation.appWrap.addEventListener("touchmove", $.sliding.touchmove);
	navigation.appWrap.addEventListener("touchend", $.sliding.touchend);
	navigation.appWrap.addEventListener("touchcancel", $.sliding.touchend);
};

exports.unBindOpenOnSlide = function() {
	navigation.appWrap.removeEventListener("touchstart", $.sliding.touchstart);
	navigation.appWrap.removeEventListener("touchmove", $.sliding.touchmove);
	navigation.appWrap.removeEventListener("touchend", $.sliding.touchend);
	navigation.appWrap.removeEventListener("touchcancel", $.sliding.touchend);
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
		navigation.open("topview", {title: 'Topview', topLevel: true, identifier: 'topview'});
	}
	else {
		exports.close();
	}
});
$.buttonExit.addEventListener("click", function(e) {
	navigation.exit();
});

