(function() {
  var TimeSeries, moment, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  moment = require("moment");

  _ = require("lodash");

  module.exports = TimeSeries = (function() {
    function TimeSeries(raw, _opt) {
      this.raw = raw;
      this.hour = __bind(this.hour, this);
      this.day = __bind(this.day, this);
      this.week = __bind(this.week, this);
      this.month = __bind(this.month, this);
      this._returnTimestamp = __bind(this._returnTimestamp, this);
      this._toMoment = __bind(this._toMoment, this);
      this._toTimestamp = __bind(this._toTimestamp, this);
      this._toDate = __bind(this._toDate, this);
      this._calc = __bind(this._calc, this);
      this.opt = _.extend({}, {
        timekey: "ts",
        countkey: "msgs",
        timeformat: "ms"
      }, _opt);
      return;
    }

    TimeSeries.prototype._calc = function(frame, steps, beginat) {
      var dataidx, end, ret, start, step, _cursor, _cursorEnd, _data, _dataTS, _frame, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _saveidx, _startCursor;
      end = beginat.startOf(frame);
      start = beginat.clone().add(frame, 1);
      step = moment(0).add(steps, 1).valueOf();
      ret = [];
      _cursor = end.valueOf();
      _cursorEnd = start.valueOf();
      dataidx = 0;
      _startCursor = _cursor;
      _frame = {
        cnt: 0,
        sum: 0
      };
      _saveidx = 0;
      while (_cursor < _cursorEnd && _saveidx < 20000) {
        if (((_ref = this.raw) != null ? _ref[dataidx] : void 0) != null) {
          _dataTS = this._toTimestamp((_ref1 = this.raw) != null ? (_ref2 = _ref1[dataidx]) != null ? _ref2[this.opt.timekey] : void 0 : void 0);
        } else {
          _dataTS = +Infinity;
        }
        if (_dataTS < _startCursor) {
          dataidx++;
        } else if (dataidx === 0 && _dataTS > _cursor) {
          _data = {};
          _data[this.opt.timekey] = this._returnTimestamp(_cursor);
          _data[this.opt.countkey] = 0;
          _data._date = moment(_cursor).format("LLLL");
          ret.push(_data);
          _cursor += step;
        } else if (_dataTS >= _cursor) {
          if (((_ref3 = this.raw) != null ? _ref3[dataidx] : void 0) != null) {
            _frame.cnt++;
            _frame.sum += (_ref4 = this.raw) != null ? (_ref5 = _ref4[dataidx]) != null ? _ref5[this.opt.countkey] : void 0 : void 0;
          }
          _data = {};
          _data[this.opt.timekey] = this._returnTimestamp(_cursor);
          _data[this.opt.countkey] = (_frame.cnt > 0 ? Math.round(_frame.sum / _frame.cnt) : 0);
          _data._date = moment(_cursor).format("LLLL");
          ret.push(_data);
          _cursor += step;
          _frame = {
            cnt: 0,
            sum: 0
          };
          dataidx++;
        } else if ((((_ref6 = this.raw) != null ? _ref6[dataidx] : void 0) != null) && _dataTS <= _cursor) {
          _frame.cnt++;
          _frame.sum += (_ref7 = this.raw) != null ? (_ref8 = _ref7[dataidx]) != null ? _ref8[this.opt.countkey] : void 0 : void 0;
          dataidx++;
        } else {
          _cursor += step;
        }
        _saveidx++;
      }
      return ret;
    };

    TimeSeries.prototype._toDate = function(inp) {
      if (inp instanceof Date) {
        return inp;
      } else if (moment.isMoment(inp)) {
        return inp._d;
      } else if (_.isNumber(inp)) {
        switch (this.opt.timeformat) {
          case "ms":
            return new Date(inp);
          case "s":
            return new Date(inp * 1000);
          default:
            throw "unkown timeformat";
        }
      } else {
        throw "invalid Date";
      }
    };

    TimeSeries.prototype._toTimestamp = function(inp) {
      if (inp instanceof Date) {
        return inp.getTime();
      } else if (moment.isMoment(inp)) {
        return inp.valueOf();
      } else if (_.isNumber(inp)) {
        switch (this.opt.timeformat) {
          case "ms":
            return inp;
          case "s":
            return inp * 1000;
          default:
            throw "unkown timeformat";
        }
      } else {
        throw "invalid Date";
      }
    };

    TimeSeries.prototype._toMoment = function(inp) {
      var _m;
      console.log("_toMoment", inp instanceof Date, moment.isMoment(inp), _.isNumber(inp));
      if (inp instanceof Date) {
        return moment(inp);
      } else if (moment.isMoment(inp)) {
        return inp;
      } else if (_.isNumber(inp)) {
        switch (this.opt.timeformat) {
          case "ms":
            return moment(inp);
          case "s":
            return moment.unix(inp);
          default:
            throw "unkown timeformat";
        }
      } else if (_.isString(inp)) {
        if (!isNaN(parseInt(inp, 10))) {
          switch (this.opt.timeformat) {
            case "ms":
              return moment(inp);
            case "s":
              return moment.unix(inp);
            default:
              throw "unkown timeformat";
          }
        }
        _m = moment(inp);
        if (!_m.isValid()) {
          throw "invalid Date";
        }
        return _m;
      } else {
        throw "invalid Date";
      }
    };

    TimeSeries.prototype._returnTimestamp = function(inp) {
      switch (this.opt.timeformat) {
        case "ms":
          return inp;
        case "s":
          return Math.round(inp / 1000);
        default:
          throw "unkown timeformat";
      }
    };

    TimeSeries.prototype.month = function(start, end) {
      return this._calc("M", "d", start != null ? this._toMoment(start) : moment());
    };

    TimeSeries.prototype.week = function(start) {
      return this._calc("w", "d", start != null ? this._toMoment(start) : moment());
    };

    TimeSeries.prototype.day = function(start) {
      return this._calc("d", "h", start != null ? this._toMoment(start) : moment());
    };

    TimeSeries.prototype.hour = function(start) {
      return this._calc("h", "m", start != null ? this._toMoment(start) : moment());
    };

    return TimeSeries;

  })();

}).call(this);
