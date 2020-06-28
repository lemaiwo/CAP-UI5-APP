/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"be/wl/CAPDemoUI/test/integration/PhoneJourneys"
	], function() {
		QUnit.start();
	});
});