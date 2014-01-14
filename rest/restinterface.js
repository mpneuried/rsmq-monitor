(function() {
  var RestInterface, StatsManager, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  StatsManager = require("../").StatsManager;

  module.exports = RestInterface = (function(_super) {
    __extends(RestInterface, _super);

    function RestInterface() {
      this.graph = __bind(this.graph, this);
      this.list = __bind(this.list, this);
      this.createRoutes = __bind(this.createRoutes, this);
      _ref = RestInterface.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    RestInterface.prototype.createRoutes = function(basepath, express) {
      this.basepath = basepath;
      express.get("" + basepath + "list", this.list);
      express.get("" + basepath + "graph/:qname", this.graph);
    };

    RestInterface.prototype.list = function(req, res) {
      var _this = this;
      StatsManager.list(function(err, stats) {
        if (err) {
          _this._error(err);
          return;
        }
        res.json(stats);
      });
    };

    RestInterface.prototype.graph = function(req, res) {
      var _end, _q, _qname, _start,
        _this = this;
      _qname = req.params.qname;
      _start = req.query.start;
      _end = req.query.end;
      _q = StatsManager.get(_qname);
      if (_q == null) {
        this._error("not-found");
        return;
      }
      _q.graph(_start, _end, function(err, graph) {
        if (err) {
          _this._error(err);
          return;
        }
        res.json(graph);
      });
    };

    return RestInterface;

  })(require("./basic"));

}).call(this);
