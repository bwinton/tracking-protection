window.addEventListener("click", (event) => {
  let t = event.target;
  if (t.id == "disable") {
    self.port.emit("disable", t.toString());
  }
}, false);
