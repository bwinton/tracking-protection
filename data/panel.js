window.addEventListener("click", (event) => {
  let t = event.target;
  if (t.id == "toggle") {
    self.port.emit("toggle", t.toString());
  }
}, false);

self.port.on("reset", () => {
  console.log("reset");
  document.getElementById("toggle").disabled = true;
  document.getElementById("report").disabled = true;
  var textarea = document.getElementById("report-content");
  textarea.value = "";
  textarea.disabled = true;
});

self.port.on("enabled", () => {
  console.log("enabled");
  document.getElementById("toggle").value = "Disable and report";
  document.getElementById("toggle").disabled = false;
  document.getElementById("report").disabled = false;
  document.getElementById("report-content").disabled = false;
});

self.port.on("disabled", () => {
  console.log("disabled");
  document.getElementById("toggle").value = "Enable";
  document.getElementById("toggle").disabled = false;
  document.getElementById("report").disabled = false;
  document.getElementById("report-content").disabled = false;
});
