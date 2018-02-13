var localyticsHyperloop = require('localytics-hyperloop');
localyticsHyperloop.init('YOUR-LOCALYTICS-KEY-HERE');
localyticsHyperloop.startAppInboxBackgroundService();

$.index.open();    
$.appInboxTabWindow.add(localyticsHyperloop.getAppInboxView());

/*
 * Event Listeners
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