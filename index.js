(function() {
  module.exports.Config = require('./lib/config');

  module.exports.Basic = require('./lib/basic');

  module.exports.queueConnectors = require('./lib/queueconnector');

  module.exports.StatsReader = require('./lib/statsreader');

  module.exports.StatsManager = require('./lib/statsmanager');

  module.exports.TimeSeries = require('./lib/timeseries');

  module.exports.utils = require('./lib/utils');

  module.exports.version = '0.0.1';

}).call(this);
