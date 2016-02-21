/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-30
 * Time: 下午9:38
 * To change this template use File | Settings | File Templates.
 */ 
var express = require("express");
var router=require("./routes");
var bodyParser=require("body-parser");
var app = express();
var multipart = require('connect-multiparty');
//var multipartMiddleware = multipart();
var template = require('art-template');
var AV = require('leanengine');

template.config('base', '');
template.config('openTag','{%');
template.config('closeTag','%}');
//template.config('compress',true);
template.config('extname', '.html');
app.engine('.html', template.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
// 加载 cookieSession 以支持 AV.User  的会话状态
app.use(AV.Cloud);
app.use(AV.Cloud.CookieSession({ secret: '05XgTktKPMkU', maxAge: 1000*60*60*24, fetchUser: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/public'));
app.use(router);
module.exports = app;
