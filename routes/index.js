/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-28
 * Time: 下午9:41
 * To change this template use File | Settings | File Templates.
 */
var express = require('express');
var router = express.Router();
var AV = require('leanengine');
var APP_ID = 'h229mcsmVjAhq3Ju7jccfqjy'; // your app id
var APP_KEY = 'U8iBLQrsjrE7A32kgjeN2YJm'; // your app key
var MASTER_KEY =  'IslyhutDnP72E60ccOXERCfW'; // your app master key
AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
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
router.get('/login', function(req, res, next) {//正常访问登录页
    render(req,res,{data:{title: '用户登录'},template:"login"});
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
    render(req,res,{data:{title: '用户登录'},template:"register"});
});
router.post('/register', function(req, res, next) {
    var cur_controller = require('../controller/register.js');
    cur_controller.init(req,res,{render:render,AV:AV});
});
function render(req,res,obj){//所有controller处理完毕，此处同意在做处理
    var data = obj.data;
    data.user = AV.User.current();
    data.str_data = JSON.stringify(data)||{};//改数据转换成字符串，直接输出给页面中，js使用
    res.render(obj.template,data);
}
module.exports = router;
