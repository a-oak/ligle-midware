var index = require('./index.js');
var ligle={};
ligle.util=require('ligle-util');
var logger = index.logger;
var Class = ligle.util.Class;

// 功能类定义：
// 渲染器
var Renderer = Class.extend({
  __classname:'Renderer',
  init:function(req,res){
    this.res=res;
    this.req=req;
  },
  /**
   * 普通渲染，跟res.render一致
   *
   * @method
   * @param {string} file 模板文件
   * @param {obj} obj 渲染对象
   * @return {null}
   */
  render:function(file,obj){
    obj = this._wrap(obj);
    this.res.render(file, obj);
  },
  /**
   * 便利的渲染方法。
   *
   * 如果传入失败对象：渲染err对象被包装到obj.error中，渲染。
   * 如果没有传入失败对象：则正常渲染obj。
   * 注：模板文件可以传入一个或两个。如果两个，则第一个为成功模板，第二个为失败模板
   * 
   * @method
   * @param {string} file1 失败模板文件
   * @param {string} [file2=file1] 成功模板文件
   * @param {obj} err 失败信息对象
   * @param {obj} obj 渲染对象
   * @return {null}
   */
  renderEO:function(){
    var file_s, file_e,err,obj;
    if(arguments.length==3){
      file_e = file_s = arguments[0];
    }else if(arguments.length==4){
      file_e = arguments[0];
      file_s = arguments[1];
    }else{
      logger.error('renderEO argument number error: ',arguments.length);
    }
    err = arguments[arguments.length-2];
    obj = arguments[arguments.length-1];
    //logger.debug(arguments);
    obj = obj || {};
    if(err instanceof Error) obj.error=JSON.stringify(err.message);
    else if(err) obj.error=JSON.stringify(err);
    obj = this._wrap(obj);
    if(err) return this.res.render(file_e, obj);
    else return this.res.render(file_s, obj);
  },
  /**
   * 传入错误信息，并回退。
   *
   * @method
   * @param {string} msg 错误信息
   * @param {bool} ajax 如果为真，则只发送json错误对象。
   * @return {null}
   */
  errorBack:function(msg,ajax){
    msg = JSON.stringify(msg);
    if(!ajax){
      this.req.flash('error', msg);
      this.res.redirect('back');
      return;
    }
    else{
      this.res.status(403).json({error:msg});
      return;
    }
  },
  /**
   * 传入成功信息，并回退。
   *
   * @method
   * @param {string} msg 成功信息
   * @param {bool} ajax 如果为真，则只发送json错误对象。
   * @return {null}
   */
  successBack:function(msg,ajax){
    msg = JSON.stringify(msg);
    if(!ajax){
      this.req.flash('success', msg);
      this.res.redirect('back');
      return;
    }
    else{
      this.res.status(200).json({success:msg});
      return;
    }
  },
  // 非ajax则渲染页面，ajax则返回成功204。
  successRender:function(file,obj,ajax){
    if(ajax){
      this.res.sendStatus(204);
      return;
    }else{
      this.render(file,obj);
    }
  },
  errorRender:function(file,obj,ajax){
    var o = {error:obj};
    if(ajax){
      this.res.status(403).json(o);
      return;
    }else{
      this.render(file,o);
    }
  },
  _wrap:function(obj){
    obj = obj || {};
    // 这里统一名字，以前的succ,err去掉。方便扩展性，如果以后支持多个
    // flash的词，这里可以很好的扩展。
    this.success = this.req.flash('success').toString();
    this.error = this.req.flash('error').toString();
    this.user = this.req.session.user;
    this.status = this.req.session.status;
    this.group = this.req.session.group;

    this._objField(obj,'success');
    this._objField(obj,'error');
    this._objField(obj,'user');
    this._objField(obj,'status');
    this._objField(obj,'group');
    return obj;
  },
  _objField:function(obj,fieldname){
    obj[fieldname] = (obj[fieldname] || this[fieldname]) || '';
  }
});

module.exports = Renderer;
