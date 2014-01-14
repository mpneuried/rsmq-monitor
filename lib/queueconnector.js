(function() {
  var Config, QueueConnector, QueuesConectors, RedisMQ, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Config = require("../").Config;

  utils = require("../").utils;

  RedisMQ = require("rsmq");

  module.exports = new (QueuesConectors = (function(_super) {
    __extends(QueuesConectors, _super);

    function QueuesConectors() {
      this.has = __bind(this.has, this);
      this.get = __bind(this.get, this);
      this.list = __bind(this.list, this);
      this.queues = {};
      return;
    }

    QueuesConectors.prototype.list = function() {
      return Object.keys(this.queues);
    };

    QueuesConectors.prototype.get = function(name) {
      if (!this.has(name)) {
        this.queues[name] = new QueueConnector({
          qname: name
        });
      }
      return this.queues[name];
    };

    QueuesConectors.prototype.has = function(name) {
      return this.queues[name] != null;
    };

    return QueuesConectors;

  })(require("../").Basic))();

  QueueConnector = (function(_super) {
    __extends(QueueConnector, _super);

    QueueConnector.prototype.defaults = function() {
      return this.extend(true, {}, QueueConnector.__super__.defaults.apply(this, arguments), {
        qname: Config.get("queuename") || "monitortest"
      });
    };

    QueueConnector.prototype.rsmqMirrorMethods = ["changeMessageVisibility", "createQueue", "deleteMessage", "deleteQueue", "getQueueAttributes", "receiveMessage", "sendMessage"];

    function QueueConnector() {
      this._getQueue = __bind(this._getQueue, this);
      this._mirrorRsmq = __bind(this._mirrorRsmq, this);
      this._logname = __bind(this._logname, this);
      this.defaults = __bind(this.defaults, this);
      var method, _i, _len, _ref;
      QueueConnector.__super__.constructor.apply(this, arguments);
      this.getter("qname", function() {
        return this.config.qname;
      });
      this.rsmqConf = Config.get("rsmq");
      this.ready = false;
      this.getQueue = this._waitUntil(this._getQueue, "connect");
      _ref = this.rsmqMirrorMethods;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        this._mirrorRsmq(method);
      }
      this.redisConnect();
      this.getQueue();
      return;
    }

    QueueConnector.prototype._logname = function() {
      return this.constructor.name + ":" + (this.qname || "-");
    };

    QueueConnector.prototype._mirrorRsmq = function(method) {
      var _this = this;
      return this[method] = this._waitUntil(function(opt, cb) {
        _this.extend(opt, {
          qname: _this.config.qname
        });
        _this.rsmq[method](opt, cb);
      });
    };

    QueueConnector.prototype._getQueue = function() {
      var _this = this;
      this.debug("getqueue");
      if (this.rsmqConf.rsmq == null) {
        this.rsmq = new RedisMQ({
          client: this.redis,
          ns: this.rsmqConf.namespace
        });
        this.rsmqConf.rsmq = this.rsmq;
      } else {
        this.rsmq = this.rsmqConf.rsmq;
      }
      this.rsmq.createQueue({
        qname: this.config.qname
      }, function(err, resp) {
        if ((err != null ? err.name : void 0) === "queueExists") {
          _this.debug("queue allready existed");
          _this.ready = true;
          _this.emit("ready");
          return;
        }
        if (err) {
          _this.error(err);
          _this.ready = false;
          return;
        }
        if (resp === 1) {
          _this.debug("queue created");
        } else {
          _this.debug("queue allready existed");
        }
        _this.ready = true;
        _this.emit("ready");
      });
    };

    return QueueConnector;

  })(require("../").Basic);

}).call(this);
