/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

var self = require('sdk/self');
var winutils = require('sdk/window/utils');

var { UITelemetry } = require('resource://gre/modules/UITelemetry.jsm');

var bucket = 0;

const PREF = 'privacy.trackingprotection.enabled';
const PB_PREF = 'privacy.trackingprotection.pbmode.enabled';
var prev_pref = false;
var prev_pb_pref = false;

var load = function () {
  let {Services, TrackingProtection, Ci} = winutils.getMostRecentBrowserWindow();

  prev_pref = Services.prefs.getBoolPref(PREF);
  Services.prefs.setBoolPref(PREF, true);
  prev_pb_pref = Services.prefs.getBoolPref(PB_PREF);
  Services.prefs.setBoolPref(PB_PREF, true);

  TrackingProtection.onSecurityChange(Ci.nsIWebProgressListener.STATE_BLOCKED_TRACKING_CONTENT);
};

var unload = function () {
  let {Services, TrackingProtection} = winutils.getMostRecentBrowserWindow();
  TrackingProtection.onSecurityChange(0);
  Services.prefs.setBoolPref(PREF, prev_pref);
  Services.prefs.setBoolPref(PB_PREF, prev_pb_pref);
};

exports.main = function () {
  load();

  if (UITelemetry.enabled) {
    UITelemetry.removeSimpleMeasureFunction('tracking-protection');
    UITelemetry.addSimpleMeasureFunction('tracking-protection', () => ({ bucket }));
  }

};

exports.onUnload = function (reason) {
  unload();

  if (UITelemetry.enabled && reason !== 'shutdown') {
    UITelemetry.removeSimpleMeasureFunction('tracking-protection');
  }
};
