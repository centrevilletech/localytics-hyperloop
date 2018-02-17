## localytics-hyperloop [![Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://www.appcelerator.com/titanium/)


[![Localytics Logo](localytics.png)](https://www.localytics.com/)

This project provides a helper library called "localytics-hyperloop.js" inside of the
lib folder that allows you to take advantage of the Localytics native SDKs inside of your Titanium app.
Also includes sample code showing you how to use the methods developed for Localytics using Hyperloop so far.

### Features
- [x] Tag Event
- [x] Tag Screen
- [x] Set Profile Attribute
- [x] Customer Identifier Method Support (for setting email, name, id, etc.)
- [x] Trigger manual data upload.
- [x] App Inbox Support for iOS
- [ ] TODO: App Inbox Support for Android
- [ ] TODO: Add support for handling incoming push notifications.

### Roadmap

The initial version of this project provides enough to use the basics of Localytics on iOS and Android,
and also the app inbox on iOS. AppInbox support for Android is planned in the future.

### Preparing your environment.

First, make sure you have Titanium SDK "7.1.0.v20180207124118" installed on your system. If you don't have it yet, you
can install it by running `ti sdk install 7.1.0.v20180207124118`.

Second, make sure CocoaPods is installed on your system.

Third, edit "index.js" and make sure you specify your personal Localytics key. You can get this
from your Localytics dashboard.

### Running the App

#### Via Appcelerator Studio

1. Import it via *Dashboard* if available.
2. Or import it via *File > Import... > Git > Git Repository as New Project* with *URI*:

		https://github.com/centrevilletech/localytics-hyperloop

3. Select a Simulator or Device to build to via *Run > Run As*.

#### Via CLI

1. Clone the repository:

		git clone https://github.com/centrevilletech/localytics-hyperloop

2. To run it with `appc run` first import it to the platform:

		appc new --import --no-services

3. Build to Simulator or Device:

		[appc run | ti build] -p ios [-T device]

### Contribution

Code contributions are greatly appreciated, please submit a new [pull request](https://github.com/centrevilletech/localytics-hyperloop/pull/new/master)!

### Legal Stuff

Appcelerator is a registered trademark of Appcelerator, Inc. Titanium is
a registered trademark of Appcelerator, Inc.  Please see the LEGAL information about using our trademarks,
privacy policy, terms of usage and other legal information at [http://www.appcelerator.com/legal](http://www.appcelerator.com/legal).
