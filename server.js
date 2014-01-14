(function() {
  var Config, Server, express, http, path, redis, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  redis = require("redis");

  express = require('express');

  http = require("http");

  path = require("path");

  Config = require("./").Config;

  _ = require('lodash')._;

  module.exports = Server = (function(_super) {
    __extends(Server, _super);

    Server.prototype.defaults = function() {
      return this.extend(Server.__super__.defaults.apply(this, arguments), {
        port: 8400,
        host: "localhost",
        listenHost: null,
        basepath: "/",
        title: "RSMQ Monitor"
      });
    };

    function Server(options) {
      this.send404 = __bind(this.send404, this);
      this.allowCrossDomain = __bind(this.allowCrossDomain, this);
      this.start = __bind(this.start, this);
      this.load = __bind(this.load, this);
      this.configure = __bind(this.configure, this);
      this.defaults = __bind(this.defaults, this);
      Server.__super__.constructor.call(this, null, options);
      this.express = express();
      this.on("configured", this.load);
      this.on("loaded", this.start);
      this.rest = {};
      this.configure();
      return;
    }

    Server.prototype.configure = function() {
      var expressConf;
      this.debug("configue express");
      expressConf = Config.get("express");
      this.express.set("title", this.config.title);
      this.express.use(this.allowCrossDomain);
      this.express.use(express.cookieParser());
      this.express.use(express.logger(expressConf.logger));
      this.express.use(express.compress());
      this.express.use(express.bodyParser({
        uploadDir: expressConf.tmpFolder
      }));
      this.express.use(express["static"](path.resolve(__dirname, "../static"), {
        maxAge: expressConf.staticCacheTime
      }));
      this.express.set('views', path.resolve(__dirname, '../views'));
      this.express.set('view engine', 'jade');
      /*
      		i18n = require('i18next')
      		i18n.init
      			fallbackLng: "de"
      			resGetPath: 'static/i18n/__lng__/__ns__.json'
      
      		i18n.registerAppHelper(@express)
      */

      this.emit("configured");
    };

    Server.prototype.load = function() {
      this.rest.gui = new (require("./rest/restinterface"))(this, "gui");
      this.rest.gui.createRoutes(this.config.basepath, this.express);
      this.express.use(this.send404);
      this.emit("loaded");
    };

    Server.prototype.start = function() {
      var server;
      server = http.createServer(this.express);
      server.listen(this.config.port, this.config.listenHost);
      this.info("http listen to port " + this.config.listenHost + ":" + this.config.port);
    };

    Server.prototype.allowCrossDomain = function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      if ("OPTIONS" === req.method) {
        return res.send(200);
      } else {
        return next();
      }
    };

    Server.prototype.send404 = function(req, res) {
      if (req.url === "/") {
        this.rest.gui.redirBase(req, res);
      } else {
        res.status(404);
        res.send("Page not found!");
      }
    };

    return Server;

  })(require("./").Basic);

}).call(this);
