/*
 * localytics-hyperloop.js
 * A library developed for interfacing with Localytics using HYPERLOOP in Titanium.
 * Developed originally by @Ampat on the TiSlack channel.
 * App inbox support added by Nazrdogan and Josh Lambert (@zettageek) on the TiSlack channel.
 * Special thanks to Hans Knöchel (@hansemannnn) and Jason Kneen (@jasonkneen) for the amazing work they put in for the Titanium community.
 */

var Localytics,
	TiApp,
	InboxViewController,
	NavigationController,
	appInboxBackgroundService,
	appInboxBackgroundServiceStatus = false,
	currentInboxMessages = [];

exports.init = function(localyticsKey) {
	_init(localyticsKey);
};

function _init(localyticsKey) {
	if ((!Alloy.CFG.localyticsTestMode)) {
		if (OS_IOS) {
			TiApp = require('Titanium/TiApp');
			Localytics = require("Localytics/Localytics");
			Localytics.autoIntegrateLaunchOptions(localyticsKey, TiApp.app.launchOptions);
			Localytics.setLoggingEnabled(true);
			InboxViewController = require("Localytics/LLInboxViewController");
			NavigationController = require('UIKit/UINavigationController');
		} else {
			var Activity = require('android.app.Activity');
			var currentActivity = new Activity(Ti.Android.currentActivity);
			var LocalyticsActivityLifecycleCallbacks = require('com.localytics.android.LocalyticsActivityLifecycleCallbacks');
			Localytics = require('com.localytics.android.Localytics');
			var app = currentActivity.getApplication();
			Localytics.integrate(currentActivity.getApplication().getApplicationContext());
			app.registerActivityLifecycleCallbacks(new LocalyticsActivityLifecycleCallbacks(app.getApplicationContext()));
			Localytics.setLoggingEnabled(true);
		}
	}
}

exports.tagEvent = function(eventName, eventData) {
	if (eventName && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			if (!eventData) {
				Localytics.tagEvent(eventName);
			} else {
				if (OS_IOS) {
					Localytics.tagEventAttributes(eventName, eventData);
				} else {
					Localytics.tagEvent(eventName, eventData);
				}
			}
		} else {
			_init(Alloy.Globals.localyticsKey);
			if (!eventData) {
				Localytics.tagEvent(eventName);
			} else {
				if (OS_IOS) {
					Localytics.tagEventAttributes(eventName, eventData);
				} else {
					Localytics.tagEvent(eventName, eventData);
				}
			}
		}
	}
};

exports.tagScreen = function(screenName) {
	if (screenName && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			Localytics.tagScreen(screenName);
		} else {
			_init(Alloy.Globals.localyticsKey);
			Localytics.tagScreen(screenName);
		}
	}
};

exports.setProfileAttribute = function(key, value) {
	if (key && value && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			if (OS_IOS) {
				Localytics.setValueForProfileAttribute(value, key);
			} else {
				Localytics.setProfileAttribute(value, key);
			}
		} else {
			if (OS_IOS) {
				_init(Alloy.Globals.localyticsKey);
				Localytics.setValueForProfileAttribute(value, key);
			} else {
				_init(Alloy.Globals.localyticsKey);
				Localytics.setProfileAttribute(value, key);
			}
		}
	}
};

/*
 * AppInbox Methods
 */

// Returns the app inbox view that you can embed into your app.
// This is a standard view like any other that you can set a width/height/opacity/etc on.
exports.getAppInboxView = function () {
	if (OS_ANDROID) {
		console.error('getAppInboxView() is not currently supported on Android.');
		return;
	}
	if (!inboxViewController) {
		// TODO: Remove the titlebar of the AppInbox until a campaign is opened. Then hide it again after a campaign is closed.
		var inboxViewController = InboxViewController.alloc().init();
		var navigationController = NavigationController.alloc().initWithRootViewController(inboxViewController);
		containerView = Ti.UI.createView();
		containerView.add(navigationController.view);
		return containerView;
	}
};

// Returns the cached app inbox campaigns from the library cache.
// If none are in the cache, youll get an empty array.
// You MUST run startAppInboxBackgroundService() before this will return anything.
exports.getAppInboxCampaigns = function () {
	if (OS_ANDROID) {
		console.error('getAppInboxCampaigns() is not currently supported on Android.');
		return;
	}
	return currentInboxMessages;
};

// Starts a background service for fetching app inbox campaigns and storing them in the library cache.
exports.startAppInboxBackgroundService = function (serviceInterval) {
	if (OS_ANDROID) {
		console.error('startAppInboxBackgroundService() is not currently supported on Android.');
		return;
	}
	// Set default background service interval to 30 seconds.
	if (typeof serviceInterval === 'undefined') {
		serviceInterval = 30000;
	}
	if (!appInboxBackgroundService) {
		// Method to pull the campaigns in from Localytics.
		function doTheUpdate() {
			if (OS_IOS) {
				console.log('Pulling latest app inbox campaigns from Localytics ...');
				Localytics.refreshInboxCampaigns(function(campaigns) {
					currentInboxCampaigns = campaigns;
					if (appInboxBackgroundServiceStatus == true) { // Re-queue the background service if the user hasn't stopped it.
						appInboxBackgroundService = setTimeout(doTheUpdate, serviceInterval);
					}
				});
			}
		}
		// Start the service!
		appInboxBackgroundServiceStatus = true;
		doTheUpdate();
	} else {
		console.warn('startAppInboxBackgroundService() -- No action taken, background service already running.');
	}
};

// Stops the background service that populates the library cache with app inbox campaigns.
exports.stopAppInboxBackgroundService = function () {
	if (OS_ANDROID) {
		console.error('stopAppInboxBackgroundService() is not currently supported on Android.');
		return;
	}
	appInboxBackgroundServiceStatus = false;
	if (typeof appInboxBackgroundService !== 'undefined') {
		clearTimeout(appInboxBackgroundService);
	}
};

/*
 * Customer identification methods.
 */

// Used to set a customer ID. Example: 3neRKTxbNWYKM4NJ
exports.setCustomerId = function(customerId) {
	if (customerId && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			Localytics.setCustomerId(customerId);
		} else {
			_init(Alloy.Globals.localyticsKey);
			Localytics.setCustomerId(customerId);
		}
	}
};

// Used to set a customer first name. Example: John
exports.setFirstName = function(firstName) {
	if (firstName && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			Localytics.setCustomerFirstName(firstName);
		} else {
			_init(Alloy.Globals.localyticsKey);
			Localytics.setCustomerFirstName(firstName);
		}
	}
};

// Used to set a customer first name. Example: Doe
exports.setLastName = function(lastName) {
	if (lastName && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			Localytics.setCustomerLastName(lastName);
		} else {
			_init(Alloy.Globals.localyticsKey);
			Localytics.setCustomerLastName(lastName);
		}
	}
};

// Used to set a customer first name. Example: John Doe
exports.setFullName = function(fullName) {
	if (fullName && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			Localytics.setCustomerFullName(fullName);
		} else {
			_init(Alloy.Globals.localyticsKey);
			Localytics.setCustomerFullName(fullName);
		}
	}
};

// Used to set a customer email address. Example: sir.john@smith.com
exports.setEmailAddress = function(emailAddress) {
	if (emailAddress && (!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			Localytics.setCustomerEmail(emailAddress);
		} else {
			_init(Alloy.Globals.localyticsKey);
			Localytics.setCustomerEmail(emailAddress);
		}
	}
};

/*
 * System methods.
 */

// Used to trigger a manual upload of the Localytics data.
exports.upload = function() {
	if ((!Alloy.CFG.localyticsTestMode)) {
		if (Localytics) {
			Localytics.upload();
		} else {
			_init(Alloy.Globals.localyticsKey);
			Localytics.upload();
		}
	}
};

/*
 * EOF
 */