(function() {
  var BasicRest, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require("lodash");

  module.exports = BasicRest = (function(_super) {
    __extends(BasicRest, _super);

    function BasicRest(app, name, model) {
      this.app = app;
      this.name = name;
      this.model = model;
      this.ERRORS = __bind(this.ERRORS, this);
      this._error = __bind(this._error, this);
      this._send = __bind(this._send, this);
      this.createRoutes = __bind(this.createRoutes, this);
      this.isRest = true;
      BasicRest.__super__.constructor.apply(this, arguments);
      return;
    }

    BasicRest.prototype.createRoutes = function(basepath, express) {};

    /*
    	## _send
    	
    	`apibase._send( req, data )`
    	
    	Generic send method to send the results as text or JSON string
    	
    	@param { Response } res Express Response 
    	@param { Any } data Any simple data to send to the client
    	
    	@api private
    */


    BasicRest.prototype._send = function(res, data, statusCode) {
      if (statusCode == null) {
        statusCode = 200;
      }
      if (_.isString(data)) {
        res.send(data, statusCode);
      } else {
        res.json(data, statusCode);
      }
    };

    /*
    	## _error
    	
    	`apibase._error( req, err [, statusCode] )`
    	
    	Generic error method to anser the client with an error. This method also tries to optimize the error with some details out of the **Errors detail helper**
    	
    	@param { Response } res Express Response 
    	@param { Error|Object|String } err The error name or Object
    	@param { Number } [statusCode=500] The http status code. This could also be defined via the **Errors detail helper**
    	
    	@api private
    */


    BasicRest.prototype._error = function(res, err, statusCode) {
      var e, msg, _err, _msg, _ref, _ref1;
      if (statusCode == null) {
        statusCode = 500;
      }
      if (_.isString(err)) {
        if ((this._ERRORS[err] != null) && (_ref = this._ERRORS[err], statusCode = _ref[0], msg = _ref[1], _ref)) {
          _err = {
            errorcode: err,
            message: msg(err)
          };
          if (err.data != null) {
            _err.data = err.data;
          }
          res.json(_err, statusCode);
        } else {
          res.send(err, statusCode);
        }
      } else {
        if (err instanceof Error) {
          if (this._ERRORS[err.name] != null) {
            _ref1 = this._ERRORS[err.name], statusCode = _ref1[0], msg = _ref1[1];
            _err = {
              errorcode: err.name,
              message: err.message || msg(err)
            };
            if (err.data != null) {
              _err.data = err.data;
            }
          } else {
            try {
              _msg = JSON.parse(err.message);
            } catch (_error) {
              e = _error;
              _msg = err.message;
            }
            _err = {
              errorcode: err.name,
              message: _msg
            };
            if (err.data != null) {
              _err.data = err.data;
            }
          }
          if (statusCode === 500 && _err.errorcode.indexOf("validation") >= 0) {
            statusCode = 406;
          }
          res.json(_err, statusCode);
        } else {
          res.json(err.toString(), statusCode);
        }
      }
    };

    BasicRest.prototype.ERRORS = function() {
      return this.extend(BasicRest.__super__.ERRORS.apply(this, arguments), {
        "not-found": [404, "Element not found"]
      });
    };

    return BasicRest;

  })(require("../").Basic);

}).call(this);
