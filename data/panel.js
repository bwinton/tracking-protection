window.addEventListener("click", (event) => {
  let t = event.target;
  if (t.id == "toggle") {
    self.port.emit("toggle", t.toString());
  }
}, false);
