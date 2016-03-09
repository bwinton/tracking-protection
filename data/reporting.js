/*
 * Socorro-collector compatible JS reporting library.
 *
 * NOTE - this file purposely does not use ES6, to be more web-compatible.
 */
var reportsServer = "http://localhost:5000/upload";
var productName = "TrackingProtection";
var version = "0.1";

function submitReport(comments, blockedScreenShot, unblockedScreenShot) {
    var serverURL = reportsServer;
    var xhr = new XMLHttpRequest();

    var form = {
        "ProductName": productName,
        "Version": version,
        "Comments": comments,
    };
    if (blockedScreenShot) {
        form["BlockedScreenShot"] = blockedScreenShot;
    }
    if (unblockedScreenShot) {
        form["UnblockedScreenShot"] = unblockedScreenShot;
    }

    xhr.open("POST", serverURL, true);
    var boundary=Math.random().toString().substr(2);
    xhr.setRequestHeader("content-type",
        "multipart/form-data; charset=utf-8; boundary=" + boundary);

    var multipart = "";
    for (var key in form) {
        multipart += "--" + boundary +
            "\r\nContent-Disposition: form-data; name=\"" + key + "\"" +
            "\r\nContent-type: text/plain" +
            "\r\n\r\n" + form[key] + "\r\n";
    }
    multipart += "--" + boundary + "--\r\n";

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var status = document.getElementById("status");
          if (xhr.status == 200) {
            console.log("report id:", xhr.responseText);
            status.innerHTML = "report sent, thanks!";
            var textarea = document.getElementById("report-content");
            textarea.value = "";
          } else {
            status.innerHTML = "error submitting report, please try again.";
          }
        }
    };
    xhr.send(multipart);
    document.getElementById("status").innerHTML = "sending report...";
}

window.addEventListener("click", (event) => {
  let t = event.target;
  if (t.id == "report" || t.id == "toggle") {
    if (t.value == "Enable") {
      console.log("re-enabling tracking protection");
    } else {
      let comment = document.getElementById("report-content").value;
      submitReport(comment)
    }
  }
}, false);
