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
  exportObj.addRenderer = addRenderer;

  // make前缀代表是生成中间件的工厂
  var makeFieldChecker = require('./field-checker.js')(ligle);
  /**
   * 中间件生成器：生成检查域的中间件。
   * @method
   * @param {obj} checkCfg 检查的配置。格式为{fields:checkerName}
   * @return {function} checkFunc 中间件
   * @example
   * makeFieldChecker({nickname:'name',email:'email',phone:'cellphone'})
  */
  exportObj.makeFieldChecker = makeFieldChecker;
  
  exportObj.cfg = cfg;
  return exportObj;
};
