(function() {
  var RestInterface, StatsManager, TimeSeries, moment, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  StatsManager = require("../").StatsManager;

  TimeSeries = require("../").TimeSeries;

  _ = require("lodash");

  moment = require("moment");

  module.exports = RestInterface = (function(_super) {
    __extends(RestInterface, _super);

    function RestInterface() {
      this.gchart = __bind(this.gchart, this);
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
      express.get("" + basepath + "gchart/:qname", this.gchart);
    };

    RestInterface.prototype.list = function(req, res) {
      var _this = this;
      StatsManager.list(function(err, stats) {
        if (err) {
          _this._error(res, err);
          return;
        }
        res.json(stats);
      });
    };

    RestInterface.prototype.graph = function(req, res) {
      var _end, _q, _qname, _start, _type,
        _this = this;
      _qname = req.params.qname;
      _start = req.query.start;
      _end = req.query.end;
      _type = req.query.type || "month";
      if (_type !== "month" && _type !== "week" && _type !== "day" && _type !== "hour") {
        this._error(res, "invalid-type");
        return;
      }
      _q = StatsManager.get(_qname);
      if (_q == null) {
        this._error(res, "not-found");
        return;
      }
      _q.graph(_start, _end, function(err, graph) {
        var tS, _series;
        if (err) {
          _this._error(res, err);
          return;
        }
        if (!(graph != null ? graph.length : void 0)) {
          _this._error(res, "empty-stats");
          return;
        }
        tS = new TimeSeries(graph, {
          timeformat: "s"
        });
        _series = tS[_type](_start);
        res.json(_series);
      });
    };

    RestInterface.prototype.gchart = function(req, res) {
      var _color, _end, _fill, _noaxis, _q, _qname, _size, _start, _type,
        _this = this;
      _qname = req.params.qname;
      _start = req.query.start;
      _end = req.query.end;
      _size = req.query.size || "200x125";
      _color = req.query.color || "ff0000";
      _fill = req.query.fill || "ff7777";
      _noaxis = req.query.noaxis != null ? true : false;
      _type = req.query.type || "month";
      if (_type !== "month" && _type !== "week" && _type !== "day" && _type !== "hour") {
        this._error(res, "invalid-type");
        return;
      }
      _q = StatsManager.get(_qname);
      if (_q == null) {
        this._error(res, "not-found");
        return;
      }
      _q.graph(_start, _end, function(err, graph) {
        var el, gChartSeries, gChartXAxis, idx, tS, url, _chars, _err, _factor, _i, _len, _maxV, _minV, _series;
        if (err) {
          _this._error(res, err);
          return;
        }
        try {
          if (!(graph != null ? graph.length : void 0)) {
            _this._error(res, "empty-stats");
            return;
          }
          tS = new TimeSeries(graph, {
            timeformat: "s"
          });
          _series = tS[_type](_start);
          _chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          _maxV = _.max(_series, function(el) {
            return el.msgs;
          }).msgs;
          _minV = 0;
          _factor = (typeof _maxV === "function" ? _maxV((_chars.length - 1) / _maxV) : void 0) ? void 0 : 0;
          gChartSeries = "";
          gChartXAxis = [];
          for (idx = _i = 0, _len = _series.length; _i < _len; idx = ++_i) {
            el = _series[idx];
            switch (_type) {
              case "week":
                gChartXAxis.push(moment.unix(el.ts).format("dd"));
                break;
              case "month":
                gChartXAxis.push(moment.unix(el.ts).format("D"));
            }
            gChartSeries += _chars[Math.round(el.msgs * _factor)];
          }
          switch (_type) {
            case "hour":
              gChartXAxis = [":00", ":15", ":30", ":45", ":60"];
              break;
            case "day":
              gChartXAxis = ["0:00", "6:00", "12:00", "18:00", "24:00"];
          }
          url = "https://chart.googleapis.com/chart";
          url += "?cht=lc";
          url += "&chm=F|B," + _fill + ",0,0,0";
          url += "&chs=" + _size;
          url += "&chco=" + _color;
          url += "&chd=s:" + gChartSeries;
          if (!_noaxis) {
            url += "&chxt=x,y";
            url += "&chxl=0:|" + (gChartXAxis.join("|")) + "|1:|0|" + (Math.round(_maxV / 2)) + "|" + _maxV;
          } else {
            url += "&chxt=x,y";
          }
          console.log(url);
          res.redirect(url);
        } catch (_error) {
          _err = _error;
          _this._error(res, _err);
        }
      });
    };

    return RestInterface;

  })(require("./basic"));

  /*
  chd=s:cEAELFJHHHKUju9uuXUc
  chco=76A4FB
  chls=2.0,0.0,0.0
  chxt=x,y
  chxl=0:|0|1|2|3|4|5|1:|0|50|100
  chs=200x125
  chg=20,50,1,5
  
  https://chart.googleapis.com/chart?cht=lc
  chd=s:UVVUVVUUUVVUSSVVVXXYadfhjlllllllmmliigdbbZZXVVUUUTU
  chco=0000FF
  chls=2.0,1.0,0.0
  chxt=x,y
  chxl=0:%7CJan%7CFeb%7CMar%7CJun%7CJul%7CAug%7C1:%7C0%7C25%7C50%7C75%7C100
  chs=200x125
  chg=100.0,25.0
  chf=bg,ls,0,CCCCCC,0.15,FFFFFF,0.1
  
  https://chart.googleapis.com/chart?cht=lc
  chs=200x125
  chd=s:ATSTaVd21981uocA
  chco=224499
  chxt=x,y
  chxl=0:|Sep|Oct|Nov|Dec|1:||50|100
  chm=B,76A4FB,0,0,0
  
  https://chart.googleapis.com/chart?chs=400x225&cht=lc
  chd=t:0,5,10,7,12,6|15,40,30,27,39,54|35,25,45,47,24,46|70,55,63,59,80,60
  chm=F,0000FF,0,1:4,20,-1
  chxt=x,y,y
  chma=0,50,0,0
  chxl=2:|Series+1|Series+3|Series+2|Series+4|0:||Mon|Tue|Wed|Thur|
  chxp=2,0,35,15,70
  chxs=2,FF0000
  
  http://chart.apis.google.com/chart?cht=lc
  chco=ED9D07,76A4FB
  chs=250x100
  chdl=Visits|Pageviews
  chdlp=b
  chd=s:MQOKJJKIFFEDBBCBCIJJLSLI,wq1qhaaYkXJEFEEtFWciy9so
  chxt=x,y
  chxl=0:|14|19|1|7|13|1:|0|195
  */


}).call(this);
