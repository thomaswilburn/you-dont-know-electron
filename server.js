var hapi = require("hapi");
var inert = require("inert");
var path = require("path");
var browserify = require("browserify");

var server = new hapi.Server();
server.connection({ port: 8888 });

server.register(inert, function() {
  server.start(function() {
    console.log(server.info);
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
    console.log("serving JS file %s", req.params.file);
    var b = browserify(path.join(__dirname, "scripts", req.params.file), { debug: true });
    b.bundle(function(err, script) {
      if (err) return reply(err);
      reply(script).type("application/javascript");
    });
  }
});

var ip = require("ip");
server.route({
  path: "/ip",
  method: "GET",
  handler: function(req, reply) {
    reply(ip.address());
  }
});