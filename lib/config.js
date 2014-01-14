(function() {
  var Config, DEFAULT, extend,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DEFAULT = {
    rsmq: {
      host: "localhost",
      port: 6379,
      options: {},
      client: null,
      namespace: "rsmq"
    },
    statsreader: {
      countsampleintervall: 1,
      savestats: true
    },
    server: {
      port: 8401,
      host: "localhost",
      listenHost: null,
      basepath: "/",
      title: "RSMQ Monitor"
    },
    express: {
      logger: "dev",
      tmpFolder: null,
      staticCacheTime: 1000 * 60 * 60 * 24 * 31
    }
  };

  extend = require("extend");

  Config = (function() {
    function Config(severity) {
      this.severity = severity != null ? severity : "info";
      this.get = __bind(this.get, this);
      this.all = __bind(this.all, this);
      this.init = __bind(this.init, this);
      return;
    }

    Config.prototype.init = function(input) {
      this.config = extend(true, {}, DEFAULT, input);
      this._inited = true;
    };

    Config.prototype.all = function(logging) {
      var _all, _k, _v;
      if (logging == null) {
        logging = false;
      }
      if (!this._inited) {
        this.init({});
      }
      _all = (function() {
        var _i, _len, _ref, _results;
        _ref = this.config;
        _results = [];
        for (_v = _i = 0, _len = _ref.length; _i < _len; _v = ++_i) {
          _k = _ref[_v];
          _results.push(this.get(_k, logging));
        }
        return _results;
      }).call(this);
      return _all;
    };

    Config.prototype.get = function(name, logging) {
      var _cnf, _ref;
      if (logging == null) {
        logging = false;
      }
      if (!this._inited) {
        this.init({});
      }
      _cnf = ((_ref = this.config) != null ? _ref[name] : void 0) || null;
      if (logging) {
        logging = {
          logging: {
            severity: process.env["severity_" + name] || this.severity,
            severitys: "fatal,error,warning,info,debug".split(",")
          }
        };
        return extend(true, {}, logging, _cnf);
      } else {
        return _cnf;
      }
    };

    return Config;

  })();

  module.exports = new Config(process.env.severity);

}).call(this);
