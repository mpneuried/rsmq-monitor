(function() {
  var MessageCreator, queueConnectors, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    _this = this;

  utils = require("../").utils;

  queueConnectors = require("../").queueConnectors;

  module.exports = new (MessageCreator = (function(_super) {
    __extends(MessageCreator, _super);

    MessageCreator.prototype.defaults = function() {
      return this.extend(true, {}, MessageCreator.__super__.defaults.apply(this, arguments), {
        interval: [10, 1000],
        qname: process.argv[2] || "monitortest"
      });
    };

    function MessageCreator() {
      this.createMessage = __bind(this.createMessage, this);
      this.nextMessage = __bind(this.nextMessage, this);
      this._start = __bind(this._start, this);
      this.defaults = __bind(this.defaults, this);
      MessageCreator.__super__.constructor.apply(this, arguments);
      this.rsmq = queueConnectors.get(this.config.qname);
      this.start = this._waitUntil(this._start, "ready", this.rsmq);
      this.on("message:send", this.nextMessage);
      this.start();
      return;
    }

    MessageCreator.prototype._start = function() {
      this.debug("start");
      this.createMessage();
    };

    MessageCreator.prototype.nextMessage = function() {
      var _t;
      _t = utils.randRange(this.config.interval);
      this.debug("next messaage in " + (_t / 1000) + "s");
      this.timer = setTimeout(this.createMessage, _t);
    };

    MessageCreator.prototype.createMessage = function() {
      var _this = this;
      this.debug("createMessage");
      clearTimeout(this.timer);
      this.rsmq.sendMessage({
        qname: this.config.qname,
        message: JSON.stringify({
          "url": "http://127.0.0.1:5000",
          "random": utils.randomString(5)
        })
      }, function(err, msgid) {
        _this.emit("message:send");
        if (err != null) {
          _this.error(err);
          return;
        }
        _this.info("message send", err, msgid);
      });
    };

    return MessageCreator;

  })(require("../").Basic))();

  process.on("uncaughtException", function(err) {
    console.error(err);
  });

}).call(this);
