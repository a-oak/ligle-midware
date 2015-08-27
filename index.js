var ligle={};
ligle.util = require('ligle-util');
var configure = ligle.util.configure;

var defaultCfg = {
  loggerName:'ligle-midware',
  loggerLevel:'TRACE'
};
var exportObj;

module.exports = function(config){
  if(exportObj) return exportObj;
  exportObj={};

  var cfg = configure(config,defaultCfg);
  var logger = ligle.util.logger(cfg.loggerName,cfg.loggerLevel);
  module.exports.logger = logger;
  module.exports.cfg = cfg;
  logger.trace(cfg);

  var Renderer = require('./renderer.js');
  var addRenderer = function(req,res,next){
    res.rd = new Renderer(req,res);
    next();
  };

  exportObj.cfg = cfg;
  exportObj.addRenderer = addRenderer;
  return exportObj;
};
