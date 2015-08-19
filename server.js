var hapi = require("hapi");
var inert = require("inert");
var path = require("path");
var browserify = require("browserify");

var server = new hapi.Server();
server.connection({ port: 8888 });
server.register(inert, function() {
  server.start(function() {
    console.log("Server started:", server.info);
  });
});

server.route({
  path: "/host",
  method: "GET",
  handler: {
    file: {
      path: path.join(__dirname, "host.html")
    }
  }
});

server.route({
  path: "/client",
  method: "GET",
  handler: {
    file: {
      path: path.join(__dirname, "client.html")
    }
  }
});

server.route({
  path: "/js/{file}",
  method: "GET",
  handler: function(req, reply) {
    var b = browserify(path.join(__dirname, "scripts", req.params.file));
    b.bundle(function(err, script) {
      if (err) return reply(err);
      reply(script).type("application/javascript");
    });
  }
});