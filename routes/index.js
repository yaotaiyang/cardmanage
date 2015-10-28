/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-28
 * Time: 下午9:41
 * To change this template use File | Settings | File Templates.
 */
var index=require("../controller");
var conf=require("../controller/controller.config");
module.exports=function(app){
    app.get(/(\W+)/,function(req,res){
        var name=req.url.match(/\/+(.*?)(?:\/|$|\?)/);
        //如果url path存在，并且不是空，就处理下面，否则进入首页
        if(name&&name[0]!="/favicon.ico"&&name[0]!="/"){
            var handler=name[1];
            if(conf[handler]){
                try{
                    cur_controller=require(conf[handler].handler);
                    cur_controller.init(req,res);
                }catch(e){
                    console.log(e);
                }
            }else{
                cur_controller=require("../controller/404");
                cur_controller.init(req,res);
            }
        }else{
           var cur_controller=require("../controller/index");
            cur_controller.init(req,res);
        }
    });
    app.post("/login",function(req,res){
        cur_controller=require(conf["login"].handler);
        cur_controller.post(req,res);
    });
}
