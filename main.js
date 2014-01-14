(function() {
  var extend, fs, path,
    _this = this;

  fs = require("fs");

  path = require("path");

  extend = require("extend");

  fs.readFile(path.resolve(__dirname + "/config.json"), function(err, file) {
    var _cnf, _config;
    if ((err != null ? err.code : void 0) === "ENOENT") {
      _cnf = {};
    } else if (err) {
      throw err;
      return;
    } else {
      try {
        _cnf = JSON.parse(file);
      } catch (_error) {
        err = _error;
        err.message = "cannot parse config.json";
        throw err;
        return;
      }
    }
    _config = extend(true, {}, _cnf);
    new (require("./server"))(_config);
  });

}).call(this);
