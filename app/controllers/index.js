var localyticsHyperloop = require('localytics-hyperloop');
localyticsHyperloop.init('YOUR-LOCALYTICS-KEY-HERE');

var appInboxView = localyticsHyperloop.getAppInboxView();

$.index.open();    
$.appInboxContainerView.add(appInboxView);

/*
 * Event Listeners
 * - General Tab
 */

function doTagEventBtnClick() {
	localyticsHyperloop.tagEvent("test_event", {
		'test_event_data': String('Hello!')
	});
	alert('Test event sent! Check Localytics dashboard for "test_event".');
}

function doTagScreenBtnClick() {
	localyticsHyperloop.tagScreen("test_screen_tag");
	alert('Test screen tagged! Check Localytics dashboard for "test_screen_tag".');	
}

function doSetProfileBtnClick() {
	localyticsHyperloop.setProfileAttribute("test_profile_attribute", "This is a test attribute.");
	alert('Test profile attribute added! Check Localytics dashboard for "test_profile_attribute".');		
}

function doSetCustomerIdBtnClick() {
	localyticsHyperloop.setCustomerId('123456');
	alert('Customer ID set!');
}

function doSetFirstNameBtnClick() {
	localyticsHyperloop.setFirstName('John');
	alert('First name set!');
}

function doSetLastNameBtnClick() {
	localyticsHyperloop.setLastName('Doe');
	alert('Last name set!');
}

function doSetFullNameBtnClick() {
	localyticsHyperloop.setFullName('Mr. John Doe');
	alert('Full name set!');
}

function doSetEmailAddressBtnClick() {
	localyticsHyperloop.setEmailAddress('sir.john@smith.com');
	alert('Email address set!');
}

/*
 * Event Listeners
 * - App Inbox Tab
 */

function doReloadInboxBtnClick() {
	if (OS_IOS) {
		alert('Not supported on iOS yet.');
		// appInboxView.reload();
	} else {
		appInboxView.reload(function () {
			alert('Reloaded the AppInbox successfully!');
		});
	}
}

/*
 * Event Listeners
 * - Misc Tab
 */

function doUploadBtnClick() {
	localyticsHyperloop.upload();
	alert('Hit the Upload method!');
}

function doStartAppInboxBackgroundServiceBtnClick() {
	if (OS_IOS) {
		localyticsHyperloop.startAppInboxBackgroundService();
		alert('Started the background service!');
	} else {
		alert('Not supported on Android!');
	}
}

function doStopAppInboxBackgroundServiceBtnClick() {
	if (OS_IOS) {
		localyticsHyperloop.stopAppInboxBackgroundService();
		alert('Stopped the background service!');
	} else {
		alert('Not supported on Android!');
	}	
}