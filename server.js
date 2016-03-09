"use strict";

let PORT = process.env.PORT || 5000;
let formidable = require("formidable"),
    http = require("http"),
    util = require("util");

http.createServer(function(req, res) {
  if (req.method.toLowerCase() == "post") {
    console.log("incoming POST request");
    if (!req.url == "/upload") {
        console.error("invalid URL:", req.url);
        return;
    }
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if (err) {
        console.error(err.message);
        return;
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(200, {"content-type": "text/plain"});
      res.write("received upload:\n\n");
      let json_response = util.inspect({fields: fields, files: files});
      res.end(json_response);
      console.log(json_response);
    });
    return;
  } else {
    console.error("invalid request method", req.method);
  }
  res.writeHead(200, {"content-type": "text/plain"});
  res.end();
}).listen(PORT);

console.log("listening on port:", PORT);
