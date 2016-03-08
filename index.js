var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");

var button = ToggleButton({
  id: 'tracking-button',
  label: 'Tracking Protection',
  icon: {
    '18': './shield-error-icon-16.png',
    '32': './shield-error-icon-32.png',
    '64': './shield-error-icon-64.png'
  },
  onChange: (state) => {
    if (state.checked) {
      panel.show({
        position: button
      });
    }
  }
});

var panel = panels.Panel({
  contentURL: './panel.html',
  onHide: () => {
    button.state('window', {checked: false});
  }
});
