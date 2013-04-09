var navigation = Alloy.createController("navigation");
Alloy.Globals.navigation = navigation;
var conf = {};

/* -- Bootstrap your application below this line -- */

conf = {
	index: "demo_welcome",
	defaultOpenTransition: {transition: 'slideInFromRight', duration: 150},
	defaultBackTransition: {transition: 'slideInFromLeft', duration: 150},
	indexOptions: {
		topLevel: true,
		viewMode: 'nav',
		title: 'Welcome',
		identifier: 'index',
	},
	menuDriver: 'demo_menu',
	historyLimit: 10,
	bindMenu: true,
	confirmOnExit: true,
};

/* -- Bootstrap your application above this line -- */

navigation.init(conf);