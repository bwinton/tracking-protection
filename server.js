var formidable = require('formidable'),
    http = require('http'),
    util = require('util');

http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      if (err) {
        console.error(err.message);
        return;
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });
    return;
  }
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end();
}).listen(5000);
