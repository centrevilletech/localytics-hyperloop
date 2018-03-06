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
	if (OS_IOS) {

		if (!inboxViewController) {

			var detailViewController,
				detailCloseBtn;

			detailCloseBtn = Ti.UI.createButton({ 
				title: "Done",
				top: 10, 
				left: 10,
				width: 50,
				height: 50
			});

			detailCloseBtn.addEventListener('click', function () {
				TiApp.app().hideModalController(detailViewController, true);
			});
				
			var CustomInboxViewController = Hyperloop.defineClass('CustomInboxViewController', 'LLInboxViewController');
			CustomInboxViewController.addMethod({
				selector: 'tableView:didSelectRowAtIndexPath:',
				instance: true,
				arguments: ['UITableView', 'NSIndexPath'],
				callback: function (tableView, indexPath) {
					 var campaign = inboxViewController.campaignForRowAtIndexPath(indexPath);
					 detailViewController = Localytics.inboxDetailViewControllerForCampaign(campaign);	  
					 detailViewController.view.addSubview(detailCloseBtn);
					 TiApp.app().showModalController(detailViewController, true);
					 if (!campaign.isRead()) {
					 	campaign.setRead(true);
					 	tableView.reloadData();
					 }
				}
			});
			
			// TODO: Remove the titlebar of the AppInbox until a campaign is opened. Then hide it again after a campaign is closed.
			var inboxViewController = CustomInboxViewController.alloc().init();
			var returnView = Ti.UI.createView();
			returnView.add(inboxViewController.view);

			// TODO: Build out code to reload the AppInbox when this method is hit.
			returnView.reload = function (callback) {
				console.error('reload of AppInbox not supportedy yet on iOS.');
				if (typeof callback === 'function') {
					callback();
				}
			};

			return returnView;

		}

	} else if (OS_ANDROID) {

		// Load dependencies.
		var returnView = Ti.UI.createView();
		var View = require('android.view.View');
		var ListView = require('android.widget.ListView');
		var TextView = require('android.widget.TextView');
		var Activity = require('android.app.Activity');
		var InboxListAdapter = require('com.localytics.android.InboxListAdapter');
		var InboxCampaign = require('com.localytics.android.InboxCampaign');
		var LayoutInflater = require('android.view.LayoutInflater');
		var AdapterView = require('android.widget.AdapterView');     
		var Intent = require('android.content.Intent');
		var InboxDetailFragment = require('com.localytics.android.InboxDetailFragment'),
			TypedValue = require('android.util.TypedValue'),
			Gravity = require('android.view.Gravity'),
			LayoutParams = require('android.widget.FrameLayout.LayoutParams');

		// Create instances.
		var currentActivity = new Activity(Ti.Android.currentActivity);
		var inboxListAdapter = new InboxListAdapter(currentActivity);
		var inflater = LayoutInflater.from(currentActivity.getApplicationContext());
		var containerView = inflater.inflate(Titanium.App.Android.R.layout["activity_inbox"], null);
		var inboxListView = ListView.cast(containerView.findViewById(Titanium.App.Android.R.id.lv_inbox));
		var emptyTextView = TextView.cast(containerView.findViewById(Titanium.App.Android.R.id.tv_empty_inbox));

		// Setup the ListView with an adapter.
		inboxListView.setAdapter(inboxListAdapter);
		inboxListView.setEmptyView(emptyTextView);
		inboxListView.setOnItemClickListener(new AdapterView.OnItemClickListener({
            onItemClick: function(adapterView, view, i, l) {
            	
            	   var campaign = InboxCampaign.cast(inboxListAdapter.getItem(i));
            	   campaign.setRead(true);
				   inboxListAdapter.notifyDataSetChanged();
            	   var fragment = InboxDetailFragment.newInstance(campaign);
            	   
                   var detail = Ti.UI.createWindow();
	                   	
                   detail.addEventListener('open', function(){
                   	   var currentActivity = new Activity(Ti.Android.currentActivity);
		               var inflater = LayoutInflater.from(currentActivity.getApplicationContext());
		               var campaignDetailView = inflater.inflate(Titanium.App.Android.R.layout["campaign_detail"], null);
		               var innerView = Ti.UI.createView({width:'100%', height:'100%', backgroundColor:'#FFF'});
		               innerView.add(campaignDetailView);
		               detail.add(innerView);
	                   currentActivity.getFragmentManager().beginTransaction()
	                   .replace(Titanium.App.Android.R.id.ll_fragment_container, fragment)
	                   .commitAllowingStateLoss();
                   });
        
                   detail.open();    
            }
        }));
		returnView.add(containerView);

		// Used to trigger a reload of the AppInbox.
		returnView.reload = function (callback) {
			inboxListAdapter.getData(new InboxListAdapter.Listener({
				didFinishLoadingCampaigns: function () {
					console.log('AppInbox Loaded: ' + inboxListView.getAdapter().getCount());
					if (typeof callback === 'function') {
						callback();
					}
				}
			}));
		};

		// Go ahead and trigger a reload so it's populated.
		returnView.reload();

		// Return the view.
		return returnView;

	}
};

// Returns the cached app inbox campaigns from the library cache.
// If none are in the cache, youll get an empty array.
// You MUST run startAppInboxBackgroundService() before this will return anything.
exports.getAppInboxCampaigns = function () {
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