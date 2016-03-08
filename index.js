var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

var button = ToggleButton({
  id: 'candy-button',
  label: 'Candy',
  icon: {
    '18': './candy-icon-16.png',
    '32': './candy-icon-32.png',
    '64': './candy-icon-64.png'
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: './panel.html',
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}
