#AlloySingleWindowNavigation
*A single window navigation controller for Titanium.*

---
#Introduction

This is a single window navigation controller that handles views and implements slick transitions. The controller is pretty flexible and is easily extended. If you want you can use how many windows as you want in your application and only attach an instance of this controller to the windows you want it for.

The benefit of using a controller for the navigation instead of purely relying on the platform's solution is that it can be used as an abstract layer between your app and the multiple platforms you might deploy to. That way you can use the same methods for navigation for all platforms and let the controller do the platform specific actions.

If you are looking for a navigation controller for multiple windows, you can base it upon the one from the ["Forging-Titanium" tutorial series](https://github.com/appcelerator-developer-relations/Forging-Titanium/tree/master/ep-002).

#How do I use it?

In the sample provided is the `index.js` file used as a bootstrap for the app, setting up all necessary settings and initializing the controller. The controller's public properties are the ones listed near the bottom of this page. The mainWindow option of the `init` method defines what windows the navigation controller should be added to. If no window is set a new one is created.

##Transitions

There are five transitions predefined within the controller and more can be added with the `addTransition` method. The predefined ones are:

* **crossFade**  
This transition fades between the previous and the new view.

* **fade**  
Fades to a set color before fading in to the new view.

* **slideInFromRight**  
Slides in the new view from the right side of the screen.

* **slidesInFromLeft**  
Slides in the new view from  the left side of the screen.

* **none**
Simply switches the views with no animation.

Here is a simple example of opening the *welcome* controller with the *fade* transition:

```
navigation.open('welcome', {transition: 'fade', duration: '100', transitionColor: '#fff'});
```

A note about transitions. The transitions are a lot smoother on iOS due to Titanium's animation performance issues. Also do Titanium on Android have zIndex issues which causes flickering. Therefore the fade transition simply switches to black and then fades out to the new view, instead of fading into the color and then fade out to the new view.

##Demo

A reference implementation has been provided with the source which can be installed by copying the files from `app/demo/` to the correct directories. In `app/demo/` there is a BASH-script called `install_demo.sh` that will automatically copy the files to the correct location when it's run.

---
#Properties

* **index (string/Alloy.Controller)**  
The controller which will be defined as that index-view, the first view which is shown after the controller is initalized.

* **indexOptions (JSON-Object)**  
When you navigate to a controller you can provide options which will, but not only, control what transition to use when the view is opened.

* **historyLimit (int)**  
If you are experiencing performance issues when having too many controllers/views in memory you can set a limit of how many controllers to keep in the history stack before purging old controllers from the stack. 0 equals that no history is purged automatically.

* **defaultOpenTransition (JSON-Object)**  
A JSON-object defining the default values for the transition when opening a new view.

* **defaultBackTransition (JSON-Object)**  
A JSON-object defining the default values for the transition when going back in the history stack.

* **confirmOnExit (boolean)**  
This is an Android specific setting which if set to true shows a toast notification when the user has come to the end of the history stack. The message shown is warning the user that the next time the user presses back the app will exit.

#Methods
* **init**(`args`)  
Initializes the controller

* **getMainWindow**()  
Returns the mainWindow - the window which the navigation controller is attached to.

* **open**(`controller, options, callback`)  
Opens the specified controller. The controller can either be a string or an instance of Alloy.Controller. Options is a JSON-object specifying what transition to use and all other properties which you yourself will use in the controller you are opening since this object will be passed on.

* **back**(`newOptions, callback`)  
Since most of the time you will want the same options provided to the controller as when you opened it so here you can set any options which you want overridden - transition for example.

* **home**(`options, callback`)  
This is a convenience method for navigating to the index controller.

* **addTransition**(`name, action`)
Action is a function which will be mapped to the name provided. After adding a transition it can be used exactly the same as the existing ones. A transition must accept these arguments: `newView, previousView, options, callback`

* **hasTransition**(`name`)  
Returning true if the transition exists, otherwise false.

* **clearContent**()  
Clears all children from the appWrap-view of the navigation controller.

* **hasHistory**()
Returns true if the historyStack isn't empty, otherwise false.

* **clearHistory**(`historyLimit`)  
Purges history from the start of the historyStack. the provided int defines how many steps of recent history to save.

* **bindBack**()  
Binds the android hardware back button to the `back` method.

* **releaseBack**()  
Unbinds the android back button.

* **exit**()  
Convenience method for closing the mainWindow.

* **getPrevious**()  
Returns a JSON-object with the previous controller, view and it's related options.

* **getPreviousController**()  
Convenience method for `getPrevious().controller`.

* **getPreviousOptions**()  
Convenience method for `getPrevious().options`.

* **getPreviousView**()  
Convenience method for `getPrevious().view`.

* **getCurrent**()  
Returns a JSON-object with the current controller, view and it's related options.

* **getCurrentController**()  
Convenience method for `getCurrent().controller`.

* **getCurrentOptions**()  
Convenience method for `getCurrent().options`.

* **getCurrentView**()  
Convenience method for `getCurrent().view`.

* **addEventLisener**(`eventName, action`)  
Adds an event listener to the event specified related to the navigation controller.

* **removeEventLisener**(`eventName`)  
Removes an event listener from the navigation event specified.

* **fireEvent**(`eventName`)
Fires the specified event on the navigation controller.
