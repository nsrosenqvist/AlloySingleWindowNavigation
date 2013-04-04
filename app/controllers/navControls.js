var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();
var menu = null;

$.backButton = false;

exports.init = function() {
	menu = navigation.getMenuDriver();
	navigation.appWrap.add($.navWrap);
	
	$.button.addEventListener("click", menu.toggle);
};

exports.setTitle = function(title) {
	$.pageTitle.text = title;
};

exports.adjustOnTransition = function(options) {
	exports.setTitle(options.title);
		
	if (options.viewMode == 'nav') {
		exports.show();

		if (OS_IOS) {
			if (navigation.hasHistory() && ! $.backButton) {
				$.backButton = true;
				$.buttonTitle.text = "Back";
				$.button.removeEventListener("click", menu.toggle);
				$.button.addEventListener("click", navigation.back);
			}
			else {
				if ($.backButton) {
					$.backButton = false;
					$.buttonTitle.text = "Menu";
					$.button.addEventListener("click", menu.toggle);
					$.button.removeEventListener("click", navigation.back);
				}
			}
		}
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
