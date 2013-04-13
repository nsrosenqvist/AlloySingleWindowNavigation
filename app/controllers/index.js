var navigation = Alloy.Globals.navigation = Alloy.createController("navigation");

/* -- Bootstrap your application below this line -- */

var conf = {
	// The mainWindow is the window which the navigation controller will act upon. This means that you can
	// utilize several instances of the navigation controller if you'd prefer though only one is standard.
	// If the mainWindow isn't set a new one will be created which will be used.
	mainWindow: undefined,
	// The first controller which will be opened when we run navigation.init() and the one opened
	// when calling navigation.home
	index: "welcome", 
	// indexOptions holds options which will be provided when opening the home/default/welcome/index view.
	// It holds the options required for the navigation.open method, the transition which will be
	// executed and all options you yourself want connected to the opened view. This means that
	// you can set an unlimited number of custom properties which will be tied to this view in the
	// history stack - as long as you don't overwrite properties which are required for the navigation module
	indexOptions: {
		transition: 'none', // The transition used for opening the view
	},
	// How many steps of history to save, might be useful if the application is requiring a lot of memory.
	// Another solution is to call navigation.clearHistory on demand. 0 equals that there is no limit and
	// no history will be purged.
	historyLimit: 20, 
	// Default transitions and related options for opening and closing a view, transition and duration must be set
	// but transitionColor is only used in the "fade"-transition.
	defaultOpenTransition: {transition: 'none', duration: 150, transitionColor: "#fff"}, 
	defaultBackTransition: {transition: 'none', duration: 150, transitionColor: "#000"},
	
	// ANDROID SPECIFIC
	// The following decides whether the user should get a warning notification saying that the user has
	// reached the end of the history stack and that the next time the user presses back the app closes.
	confirmOnExit: true, 
};

// It's also appropriate to set platform specific settings here in the bootstrap file
if (OS_IOS) {
	conf.defaultOpenTransition = {transition: 'slideInFromRight', duration: 150, transitionColor: "#fff"}; 
	conf.defaultBackTransition = {transition: 'slideInFromLeft', duration: 150, transitionColor: "#000"};
}

/* -- Bootstrap your application above this line -- */

navigation.init(conf);