const { ToggleButton } = require("sdk/ui/button/toggle");
const panels = require("sdk/panel");
const tabs = require("sdk/tabs");
const self = require("sdk/self");
const data = require("sdk/self").data;

// This add-on uses built-in tracking protection, which doesn't have
// hooks for add-ons to use yet.
const {Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");

// enable tracking protection globally
Services.prefs.setBoolPref("privacy.trackingprotection.enabled", true);

let button = ToggleButton({
  id: "tracking-button",
  label: "Tracking Protection",
  icon: {
    "18": "./shield-error-icon-16.png",
    "32": "./shield-error-icon-32.png",
    "64": "./shield-error-icon-64.png"
  },
  onChange: (state) => {
    if (state.checked) {
      panel.show({
        position: button
      });
    }
  }
});

let panel = panels.Panel({
  contentURL: data.url("panel.html"),
  contentScriptFile: data.url("panel.js"),
  onHide: () => {
    button.state("window", {checked: false});
  }
});

panel.port.on("disable", (addonMessage) => {
  let activeTab = tabs.activeTab;
  // NOTE below is from:
  // https://dxr.mozilla.org/mozilla-central/rev/be593a64d7c6a826260514fe758ef32a6ee580f7/browser/base/content/browser-trackingprotection.js
  // Convert document URI into the format used by
  // nsChannelClassifier::ShouldEnableTrackingProtection.
  // Any scheme turned into https is correct.
  // TODO would be nice to make this easier for add-ons to extend

  // FIXME there must be a way to get at the nsIURI in activeTab...
  let url = activeTab.url.replace(/^http:\/\//, "https://");
  let normalizedUrl = Services.io.newURI(url, null, null);

  if (Services.perms.testPermission(normalizedUrl, "trackingprotection")) {
    Services.perms.remove(normalizedUrl, "trackingprotection");
  } else {
    Services.perms.add(normalizedUrl,
      "trackingprotection", Services.perms.ALLOW_ACTION);
  }

  activeTab.reload();
});
