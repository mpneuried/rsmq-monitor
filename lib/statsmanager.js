(function() {
  var Config, StatsManager, StatsReader, async,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  StatsReader = require("../").StatsReader;

  Config = require("../").Config;

  async = require("async");

  module.exports = new (StatsManager = (function(_super) {
    __extends(StatsManager, _super);

    function StatsManager() {
      this.list = __bind(this.list, this);
      this.get = __bind(this.get, this);
      this.add = __bind(this.add, this);
      this._refreshQueues = __bind(this._refreshQueues, this);
      StatsManager.__super__.constructor.apply(this, arguments);
      this.queues = {};
      this.ready = false;
      this.rsmqConf = Config.get("rsmq");
      this.refreshQueues = this._waitUntil(this._refreshQueues, "connect");
      this.redisConnect();
      this.refreshQueues();
      return;
    }

    StatsManager.prototype._refreshQueues = function(cb) {
      var _this = this;
      this.redis.smembers("" + this.rsmqConf.namespace + ":QUEUES", function(err, queues) {
        var queue, _i, _len;
        if (err) {
          if (cb != null) {
            cb(err);
          } else {
            _this.error(err);
          }
          return;
        }
        _this.debug("found queues", queues);
        for (_i = 0, _len = queues.length; _i < _len; _i++) {
          queue = queues[_i];
          _this.add(queue);
        }
        _this.ready = true;
        _this.emit("ready");
      });
    };

    StatsManager.prototype.add = function(name, cb) {
      var _q,
        _this = this;
      this.debug("add queue `" + name + "`");
      if (this.queues[name] != null) {
        this.warning("tried to add an existing queue");
        _q = this.queues[name];
      } else {
        _q = this.queues[name] = new StatsReader({
          qname: name
        });
      }
      if (cb != null) {
        if (_q.ready) {
          cb(null, _q);
        } else {
          _q.once("ready", function() {
            return cb(_q);
          });
        }
      } else {
        return _q;
      }
    };

    StatsManager.prototype.get = function(name) {
      return this.queues[name];
    };

    StatsManager.prototype.list = function(cb) {
      var queue, queuename, _fn, _fns, _ref,
        _this = this;
      _fns = [];
      _ref = this.queues;
      _fn = function(queue) {
        return _fns.push(function(cba) {
          queue.current(cba);
        });
      };
      for (queuename in _ref) {
        queue = _ref[queuename];
        _fn(queue);
      }
      async.parallel(_fns, function(err, stats) {
        if (err) {
          cb(err);
          return;
        }
        cb(null, stats);
      });
    };

    return StatsManager;

  })(require("../").Basic))();

}).call(this);
