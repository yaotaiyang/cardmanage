/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-30
 * Time: 下午9:38
 * To change this template use File | Settings | File Templates.
 */
var express = require('express');
var router=require("./routes");
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var template = require('art-template');



// 设置 view 引擎
template.config('base', '');
template.config('openTag','{%');
template.config('closeTag','%}');
template.config('compress',true);
template.config('extname', '.html');
app.use(cookieParser());
app.engine('.html', template.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');


// 加载云代码方法
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/public', express.static(__dirname + '/public'));
app.use(router);

module.exports = app;
