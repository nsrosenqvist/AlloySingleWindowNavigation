var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();
var menu = null;

$.backButton = false;

exports.init = function() {
	menu = navigation.getMenuDriver();
	navigation.appWrap.add($.navWrap);
	
	$.buttonMenu.addEventListener("click", menu.toggle);
	$.buttonBack.addEventListener("click", navigation.back);
	$.buttonBack.addEventListener("touchstart", function() {$.buttonBackWrap.backgroundColor = "#1b2026"});
	$.buttonBack.addEventListener("touchend", function() {$.buttonBackWrap.backgroundColor = "#2e3641"});
	$.buttonBack.addEventListener("touchcancel", function() {$.buttonBackWrap.backgroundColor = "#2e3641"});
};

exports.setTitle = function(title) {
	$.title.text = title;
};

exports.adjustOnTransition = function(options) {
	exports.setTitle(options.title);
		
	if (options.viewMode == 'nav') {
		exports.show();

		if ( ! options.topLevel && ! $.backButton) {
			$.buttonMenu.visible = false;
			$.buttonBackWrap.visible = true;
			$.buttonWrap.width = $.buttonBackWrap.width;
			$.backButton = true;
		}
		else {
			if ($.backButton) {
				$.buttonMenu.visible = true;
				$.buttonBackWrap.visible = false;
				$.buttonWrap.width = $.buttonMenu.width + $.buttonMenu.left + $.buttonMenu.right;
				$.backButton = false;
			}
		}
		
		$.title.left = $.buttonWrap.width + 15;
	}
	else {
		exports.hide();
	}
};

exports.show = function() {
	$.navWrap.visible = true;
	$.navWrap.height = Ti.UI.SIZE;
	
	navigation.content.height = Alloy.Globals.display.height - $.navBar.height;
	navigation.content.top = $.navBar.height;
};

exports.hide = function() {
	$.navWrap.visible = false;
	$.navWrap.height = 0;
	
	navigation.content.height = "100%";
	navigation.content.top = 0;
};

exports.addEventListener = function(eventName, action) {
	$.navWrap.addEventListener(eventName, action);
};
	
exports.removeEventListener = function(eventName, action) {
	$.navWrap.removeEventListener(eventName, action);
};
	
exports.fireEvent = function(eventName) {
	$.navWrap.fireEvent(eventName);
};
