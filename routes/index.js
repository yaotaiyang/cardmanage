/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-28
 * Time: 下午9:41
 * To change this template use File | Settings | File Templates.
 */
var express = require('express');
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var router = express.Router();
var AV = require('leanengine');
var APP_ID = process.env.LC_APP_ID;
var APP_KEY = process.env.LC_APP_KEY;
var MASTER_KEY = process.env.LC_APP_MASTER_KEY;
var path_str = './dev_conf.json';
if(fs.existsSync(path_str) && fs.statSync(path_str).isFile()){//本地调试配置
    var pathObj = JSON.parse(fs.readFileSync(path_str,"utf-8"));
    APP_ID = pathObj["DEV_KEY"]["APP_ID"];
    APP_KEY = pathObj["DEV_KEY"]["APP_KEY"];
    MASTER_KEY = pathObj["DEV_KEY"]["MASTER_KEY"];
}
AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
router.get('/*.txt',function(req,res){//根目录静态文件输出，搜索引擎文件等
    var cur_controller = require('../controller/static.js');
    cur_controller.init(req,res,{render:render,AV:AV});
});
router.get("*",function(req,res,next){ //判断登录没登录去登录页
    if(!(req.path == "/login") && !(req.path == "/register") && !AV.User.current()){
        res.redirect('/login');
    }else{
        next();
    }
});
router.get('/',function(req,res){//首页
    var cur_controller = require('../controller/index.js');
    cur_controller.init(req,res,{render:render,AV:AV});
});
router.get('/statistics',function(req,res){//统计页面
    var cur_controller = require('../controller/statistics.js');
    cur_controller.init(req,res,{render:render,AV:AV});
});
router.get('/login', function(req, res, next) {//正常访问登录页
    render(req,res,{data:{title: '敏捷管理平台-用户登录'},template:"login"});
});
router.post('/login', function(req, res, next) {//提交表单页面
    var cur_controller = require('../controller/login.js');
    cur_controller.init(req,res,{render:render,AV:AV});
});
router.get('/logout', function(req, res, next) {//登出
    AV.User.logOut();
    res.redirect('/login');
});
router.get('/register', function(req, res, next) {//用户注册页面
    render(req,res,{data:{title: '敏捷管理平台-用户注册'},template:"register"});
});
router.post('/register', function(req, res, next) {
    var cur_controller = require('../controller/register.js');
    cur_controller.init(req,res,{render:render,AV:AV});
});
router.get('/admin', function(req, res, next) {
    var cur_controller = require('../controller/admin.js');
    cur_controller.init(req,res,{render:render,AV:AV});
});
/**ajax接口**/
router.get('/ajax', function(req, res, next) {//获取卡片
    var cur_controller = require('../controller/ajax.js');
    cur_controller.init(req,res,{render:ajaxrender,AV:AV});
});
router.post('/ajax', function(req, res, next) {//获取卡片
    var cur_controller = require('../controller/ajax.js');
    cur_controller.init(req,res,{render:ajaxrender,AV:AV});
});

router.post('/upload',multipartMiddleware, function(req, res, next) {//文件上传
    var cur_controller = require('../controller/upload.js');
    cur_controller.init(req,res,{render:ajaxrender,AV:AV});
});
function ajaxrender(req,res,obj){
    res.writeHead(200, {'Content-Type': 'application/json'});
    var res_obj = {
        status:1,
        result:obj.data
    }
    if(obj.data && obj.data.err){
        res_obj.status = 0;
    }
    res.end(JSON.stringify(res_obj));
}
function render(req,res,obj){//所有controller处理完毕，此处同意在做处理
    var data = obj.data;
    if(AV.User.current()){
        data.user = AV.User.current().attributes;
        data.user.id = AV.User.current().id;
    }
    data.params = req.query;
    data.str_data = JSON.stringify(data)||{};//改数据转换成字符串，直接输出给页面中，js使用
    res.render(obj.template,data);
}
module.exports = router;
