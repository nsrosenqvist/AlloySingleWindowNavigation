var navigation = Alloy.Globals.navigation = Alloy.createController("navigation");

/* -- Bootstrap your application below this line -- */

// App configuration
var conf = {
	index: "demo_welcome",
	defaultOpenTransition: {transition: 'slideInFromRight', duration: 150},
	defaultBackTransition: {transition: 'slideInFromLeft', duration: 150},
	indexOptions: {
		topLevel: true,
		viewMode: 'nav',
		title: 'Welcome',
		identifier: 'index',
	},
	historyLimit: 10,
	confirmOnExit: true,
};

// Create menu controller
var menu = Alloy.Globals.menu = Alloy.createController("demo_menu");

/* -- Bootstrap your application above this line -- */

navigation.init(conf);
menu.init();