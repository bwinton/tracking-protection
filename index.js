/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

var self = require('sdk/self');
var tabs = require('sdk/tabs');
var winutils = require('sdk/window/utils');

var { UITelemetry } = require('resource://gre/modules/UITelemetry.jsm');

var bucket = 0;

const PREF = 'privacy.trackingprotection.enabled';
const PB_PREF = 'privacy.trackingprotection.pbmode.enabled';
var prev_pref = false;
var prev_pb_pref = false;

var prev_text;

var addTrackers = function (document, title, hosts) {
  let retval = [];
  let content = document.createElement('hbox');
  content.setAttribute('style', 'margin: 1em 0em 0em;');


  let host = document.createElement('label');
  host.setAttribute('value', title);
  host.setAttribute('style', 'font-weight: bold; margin-left: -1em');
  host.setAttribute('flex', '0');
  content.appendChild(host);

  host = document.createElement('spacer');
  host.setAttribute('flex', '1');
  content.appendChild(host);

  host = document.createElement('label');
  host.setAttribute('value', 'Blocked');
  host.setAttribute('style', 'color: Graytext; font-size: 12px');
  host.setAttribute('flex', '0');
  content.appendChild(host);

  retval.push(content);

  hosts.forEach(i => {
    let label = document.createElement('label');
    label.setAttribute('value', i);
    retval.push(label);
  });
  return retval;
};

var load = function () {
  let {Services, TrackingProtection, Ci} = winutils.getMostRecentBrowserWindow();

  prev_pref = Services.prefs.getBoolPref(PREF);
  Services.prefs.setBoolPref(PREF, true);
  prev_pb_pref = Services.prefs.getBoolPref(PB_PREF);
  Services.prefs.setBoolPref(PB_PREF, true);

  if (!prev_text) {
    let document = TrackingProtection.content.ownerDocument;
    prev_text = document.getElementById('tracking-blocked').textContent;

    // Add the sub-view.
    let subview = document.createElement('panelview');
    subview.id = 'identity-popup-trackingView';
    subview.setAttribute('flex', '1');

    let box = document.createElement('vbox');
    box.id = 'tracking-protection-content';
    box.setAttribute('flex', '1');

    let content = document.createElement('description');
    content.setAttribute('class', 'identity-popup-headline');
    content.setAttribute('crop', 'end');
    content.setAttribute('value', 'Tracking Protection');
    box.appendChild(content);

    content = document.createElement('description');
    content.id = 'identity-popup-subview-hostname';
    content.setAttribute('style', 'color: Graytext; font-size: 12px');
    content.setAttribute('observes', 'identity-popup-content-host');
    box.appendChild(content);

    content = document.createElement('label');
    content.setAttribute('style', 'height: 1em');
    box.appendChild(content);

    addTrackers(document, 'Social Trackers', ['Facebook', 'Twitter']).forEach(i => {
      box.appendChild(i);
    });
    addTrackers(document, 'Ad Trackers', ['Adsense', 'Double Click']).forEach(i => {
      box.appendChild(i);
    });
    addTrackers(document, 'Analytics Trackers', ['Google Analytics', 'Mixpanel']).forEach(i => {
      box.appendChild(i);
    });

    subview.appendChild(box);
    TrackingProtection.container.parentElement.parentElement.parentElement.querySelector('vbox.panel-subviews').appendChild(subview);

    // Add the button.
    let button = document.createElement('button');
    button.id = 'identity-popup-tracking-expander';
    button.setAttribute('class', 'identity-popup-expander');
    button.setAttribute('oncommand', 'gIdentityHandler.toggleSubView("tracking", this)');
    TrackingProtection.container.appendChild(button);
  }

  let showIcon = (tab) => {
    if (tab.url.includes('nytimes.com')) {
      TrackingProtection.icon.style.listStyleImage = `url(${self.data.url('badged-image.svg')})`;
      TrackingProtection.icon.style.width = '21px';
    } else {
      TrackingProtection.icon.style.listStyleImage = '';
      TrackingProtection.icon.style.width = '';
    }

    if (tab.url.includes('nytimes.com') || tab.url.includes('cnn.com')) {
      TrackingProtection.content.style.backgroundImage = `url(${self.data.url('badged-image.svg')})`;
      TrackingProtection.content.style.backgroundSize = '32px auto';
      TrackingProtection.content.querySelector('#tracking-blocked').textContent = 'Firefox is blocking 35 companies that may be tracking your browsing.';
      TrackingProtection.container.querySelector('#identity-popup-tracking-expander').style.display = '';
      TrackingProtection.onSecurityChange(Ci.nsIWebProgressListener.STATE_BLOCKED_TRACKING_CONTENT);
    } else {
      TrackingProtection.content.style.backgroundImage = '';
      TrackingProtection.content.style.backgroundSize = '';
      TrackingProtection.content.querySelector('#tracking-blocked').textContent = prev_text;
      TrackingProtection.container.querySelector('#identity-popup-tracking-expander').style.display = 'none';
      TrackingProtection.onSecurityChange(0);
    }
  };

  // Listen for tab content loads.
  tabs.on('pageshow', showIcon);
  tabs.on('activate', showIcon);
};

var unload = function () {
  let {Services, TrackingProtection} = winutils.getMostRecentBrowserWindow();

  let document = TrackingProtection.content.ownerDocument;
  let subview = document.getElementById('identity-popup-trackingView');
  if (subview) {
    subview.remove();
  }
  let button = document.getElementById('identity-popup-tracking-expander');
  if (button) {
    button.remove();
  }

  prev_text = null;

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
