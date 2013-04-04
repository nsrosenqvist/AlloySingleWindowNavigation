var navigation = Alloy.createController("navigation");
Alloy.Globals.navigation = navigation;
var conf = {};

/* -- Bootstrap your application below this line -- */

conf = {
	index: "welcome",
	defaultViewMode: 'nav',
	defaultOpenTransition: {transition: 'none', duration: 100},
	defaultBackTransition: {transition: 'none', duration: 100},
	indexOptions: {
		topLevel: true,
		viewMode: 'nav',
		transition: 'none',
		title: 'Welcome',
		identifier: 'index',
	},
	menu: 'menu',
	nav: 'navControls',
	bindMenu: true,
	confirmOnExit: true,
};

/* -- Bootstrap your application above this line -- */

navigation.init(conf);