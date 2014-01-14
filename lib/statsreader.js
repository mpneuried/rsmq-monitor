(function() {
  var Config, StatsReader, moment, queueConnectors,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Config = require("../").Config;

  moment = require("moment");

  queueConnectors = require("../").queueConnectors;

  module.exports = StatsReader = (function(_super) {
    __extends(StatsReader, _super);

    StatsReader.prototype.defaults = function() {
      return this.extend(true, {}, StatsReader.__super__.defaults.apply(this, arguments), {
        countsampleintervall: 1,
        savestats: true,
        qname: "monitortest"
      });
    };

    StatsReader.prototype._logname = function() {
      return this.constructor.name + ":" + (this.qname || "-");
    };

    function StatsReader() {
      this._writeMessageCount = __bind(this._writeMessageCount, this);
      this._getQueueStats = __bind(this._getQueueStats, this);
      this._graph = __bind(this._graph, this);
      this._current = __bind(this._current, this);
      this.nextStatsRead = __bind(this.nextStatsRead, this);
      this._start = __bind(this._start, this);
      this._logname = __bind(this._logname, this);
      this.defaults = __bind(this.defaults, this);
      StatsReader.__super__.constructor.apply(this, arguments);
      this.getter("qname", function() {
        return this.config.qname;
      });
      this.rsmqConf = Config.get("rsmq");
      this.rsmq = queueConnectors.get(this.qname);
      this.start = this._waitUntil(this._start, "ready", this.rsmq);
      this.current = this._waitUntil(this._current, "ready", this.rsmq);
      this.graph = this._waitUntil(this._graph, "ready", this.rsmq);
      this.on("stats:done", this.nextStatsRead);
      this.redisConnect();
      this.start();
      return;
    }

    StatsReader.prototype._start = function() {
      this.debug("start");
      this.startTime = Date.now();
      this.nextStatsRead();
    };

    StatsReader.prototype.nextStatsRead = function() {
      var _diff;
      if (!this.config.savestats) {
        return;
      }
      _diff = moment(this.lastGetTime || moment().startOf("minute")).add("m", this.config.countsampleintervall).startOf("minute").diff(moment());
      this.debug("next stats in " + (_diff / 1000) + "s");
      this.timer = setTimeout(this._getQueueStats, _diff);
    };

    StatsReader.prototype._current = function(cb) {
      var _this = this;
      this.debug("_current");
      this.rsmq.getQueueAttributes({
        qname: this.qname
      }, function(err, stats) {
        if (err) {
          cb(err);
          return;
        }
        stats.qname = _this.qname;
        cb(null, stats);
      });
    };

    StatsReader.prototype._graph = function(start, end, cb) {
      var _this = this;
      if (start == null) {
        start = moment().add("d", -7).unix();
      }
      if (end == null) {
        end = moment().unix();
      }
      this.debug("_graph");
      this.redis.zrangebyscore("" + this.rsmqConf.namespace + ":" + this.qname + ":STATS", start, end, "WITHSCORES", function(err, stats) {
        var count, idx, stat, ts, _aStats;
        _this.debug("_graph return", err, stats);
        if (err) {
          cb(err);
          return;
        }
        _aStats = (function() {
          var _i, _len, _ref, _results;
          _results = [];
          for (idx = _i = 0, _len = stats.length; _i < _len; idx = _i += 2) {
            stat = stats[idx];
            _ref = stat.split(":"), count = _ref[0], ts = _ref[1];
            _results.push({
              ts: parseInt(stats[idx + 1], 10),
              msgs: parseInt(count, 10)
            });
          }
          return _results;
        })();
        cb(null, _aStats);
      });
    };

    StatsReader.prototype._getQueueStats = function() {
      var _t,
        _this = this;
      clearTimeout(this.timer);
      this.lastGetTime = _t = moment().startOf("minute");
      this.current(function(err, stats) {
        if (err) {
          _this.error(err);
        }
        _this.debug("got stats", stats);
        _this._writeMessageCount(_t.unix(), stats.msgs);
      });
    };

    StatsReader.prototype._writeMessageCount = function(time, msgcount) {
      var _err, _key,
        _this = this;
      try {
        _key = msgcount + ":" + time;
        this.debug("write stats", time, msgcount, "" + this.rsmqConf.namespace + ":" + this.qname + ":STATS");
        this.redis.zadd("" + this.rsmqConf.namespace + ":" + this.qname + ":STATS", time, _key, function(err, result) {
          if (err) {
            _this.error(err);
          } else {
            _this.info("stats save: " + msgcount + " at " + (new Date(time * 1000)));
          }
          _this.emit("stats:done");
        });
      } catch (_error) {
        _err = _error;
        this.emit("stats:done");
        this.error(_err);
      }
    };

    return StatsReader;

  })(require("../").Basic);

}).call(this);
