var navigation = Alloy.Globals.navigation;
var mainWindow = navigation.getMainWindow();

$.buttonFade.addEventListener("click", function() {
	navigation.open("subview", {transition: 'fade', title: "Subview"});
});
$.buttonCrossFade.addEventListener("click", function() {
	navigation.open("subview", {transition: 'crossFade', title: "Subview"});
});
$.buttonSlideRight.addEventListener("click", function() {
	navigation.open("subview", {transition: 'slideInFromRight', title: "Subview"});
});
$.buttonSlideLeft.addEventListener("click", function() {
	navigation.open("subview", {transition: 'slideInFromLeft', title: "Subview"});
});
$.buttonNone.addEventListener("click", function() {
	navigation.open("subview", {transition: 'none', title: "Subview"});
});
$.buttonDefault.addEventListener("click", function() {
	navigation.open("subview", {title: "Subview"});
});
$.buttonFullscreen.addEventListener("click", function() {
	navigation.open("subview", {title: "Subview", viewMode: 'fullscreen'});
});


navigation.addTransition('custom', function(view, options) {
	var nav = navigation.getNavControlsDriver();
	var duration = (options.duration) ? options.duration : 2000;
	var transitionColor = (options.transitionColor) ? options.transitionColor : "#ff00c6";
	
	var transitionImage = Ti.UI.createImageView({
		image: navigation.appWrap.toImage(),
		height: navigation.appWrap.height,
		width: navigation.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 9,
	});
	
	var transitionView = Ti.UI.createView({
		backgroundColor: transitionColor,
		height: navigation.appWrap.height,
		width: navigation.appWrap.width,
		left: 0,
		top: 0,
		zIndex: 8,
	});
	
	mainWindow.add(transitionImage);
	mainWindow.add(transitionView);
	
	// Add new view
	navigation.clearContent();
	navigation.content.add(view);
		
	// Fade to new view
	transitionImage.animate({opacity: 0, duration: duration}, function() {
		mainWindow.remove(transitionImage);
		delete transitionImage;
				
		transitionView.animate({opacity: 0, duration: duration}, function() {
			mainWindow.remove(transitionView);
			delete transitionView;
		});
	});
});

$.buttonCustom.addEventListener("click", function() {
	navigation.open("subview", {transition: 'custom', title: "Subview"});
});
