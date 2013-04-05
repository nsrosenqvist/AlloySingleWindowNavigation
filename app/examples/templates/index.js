var navigation = Alloy.createController("navigation");
Alloy.Globals.navigation = navigation;
var conf = {};

/* -- Bootstrap your application below this line -- */

conf = {
	index: "welcome", // The first controller which will be opened when we run navigation.init();
	indexOptions: {
		topLevel: true, // Value specifying if this view is a top level view - matters mostly on your own navigation controls driver implementation
		viewMode: 'nav', // Also a value which can be used within your navigation control driver
		transition: 'none', // The transition used for opening the view
		title: 'Welcome', // A page title which can be used within your navigation control driver
		identifier: 'index', // An identifier which you can specify to keep track of your controllers - refer to demo_menu.js
		affectHistory: true, // Boolean specifying if the this view/controller should be added to the history stack
		closeMenu: true, // Whether the menu should be closed before this view/controller is opened
	},
	historyLimit: 20, // How many steps of history to save. null = infinite
	defaultViewMode: 'nav', // The default value which can be used within your navigation control driver when opening views
	defaultOpenTransition: {transition: 'none', duration: 150, transitionColor: "#fff"}, // Default transition and related options for opening a view, transition and duration must be set but transitionColor is only used in the "fade"-transition
	defaultBackTransition: {transition: 'none', duration: 150, transitionColor: "#000"}, // Default transition and related options for opening a view when navigating backwards in the history stack
	menu: 'menu', // Controller name of the menu driver
	nav: 'navControls', // Controller name of the navigation controls driver
	bindMenu: true, // Boolean setting if the android hardware button should trigger menu.toggle();
	confirmOnExit: true, // Whether the user should get a notification that warns the user when coming to the end of the history stack by the Android HW-button
	defaultCloseMenu: true, // Refer to indexOptions.closeMenu
};

// Here you can also make platform specific settings
if (OS_IOS) {
	// conf.value = "set"; //
}
else {
	// conf.value = "set"; //
}

/* -- Bootstrap your application above this line -- */

navigation.init(conf);