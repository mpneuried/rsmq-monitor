(function() {
  var Config, StatsReader,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Config = require("../").Config;

  module.exports = new (StatsReader = (function(_super) {
    __extends(StatsReader, _super);

    StatsReader.prototype.defaults = function() {
      return this.extend(true, {}, StatsReader.__super__.defaults.apply(this, arguments), {
        countsampleintervall: 1
      });
    };

    function StatsReader() {
      this.getQueueStats = __bind(this.getQueueStats, this);
      this.nextStatsRead = __bind(this.nextStatsRead, this);
      this._start = __bind(this._start, this);
      this.defaults = __bind(this.defaults, this);
      StatsReader.__super__.constructor.apply(this, arguments);
      this.on("stats:read", this.nextStatsRead);
      return;
    }

    StatsReader.prototype._start = function() {
      this.startTime = Date.now();
      this.getQueueStats();
    };

    StatsReader.prototype.nextStatsRead = function() {};

    StatsReader.prototype.getQueueStats = function() {
      var _this = this;
      this.rsmq.getQueueAttributes({
        qname: this.config.qname
      }, function(err, stats) {
        if (err) {
          _this.error(err);
        }
        _this.emit("stats:read");
      });
    };

    return StatsReader;

  })(require("../").QueueConnector))();

}).call(this);
