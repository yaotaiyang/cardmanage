/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-30
 * Time: 下午9:38
 * To change this template use File | Settings | File Templates.
 */
/*var domain = require('domain');
var path = require('path');
var express = require("express");
var router=require("./routes");
var bodyParser=require("body-parser");
var app = express();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var template = require('art-template');

var cookieParser = require('cookie-parser');
//var todos = require('./routes/todos');

//var cloud = require('./cloud');
//var AV = require('leanengine');

//template.config('base', '');
template.config('openTag','{%');
template.config('closeTag','%}');
template.config('compress',true);
template.config('extname', '.html');

app.engine('.html', template.__express);
app.set('views', path.join(__dirname, 'views'));
//app.set('views', __dirname + '/views');
app.set('view engine', 'html');
//app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));
// 加载 cookieSession 以支持 AV.User  的会话状态
//app.use(AV.Cloud.CookieSession({ secret: '05XgTktKPMkU', maxAge: 1000*60*60*24, fetchUser: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use('/public', express.static(__dirname + '/public'));

app.use(cookieParser());

app.use(function(req, res, next) {
    var d = null;
    if (process.domain) {
        d = process.domain;
    } else {
        d = domain.create();
    }
    d.add(req);
    d.add(res);
    d.on('error', function(err) {
        console.error('uncaughtException url=%s, msg=%s', req.url, err.stack || err.message || err);
        if(!res.finished) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json; charset=UTF-8');
            res.end('uncaughtException');
        }
    });
    d.run(next);
});
//app.use(router);
app.get('/', function(req, res) {
    res.render('index', { currentTime: new Date() });
});*/

var domain = require('domain');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var todos = require('./routes/todos');
var cloud = require('./cloud');
var template = require('art-template');

var app = express();

// 设置 view 引擎
template.config('base', '');
template.config('openTag','{%');
template.config('closeTag','%}');
template.config('compress',true);
template.config('extname', '.html');

app.engine('.html', template.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(express.static('public'));

// 加载云代码方法
app.use(cloud);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 未处理异常捕获 middleware
app.use(function(req, res, next) {
    var d = null;
    if (process.domain) {
        d = process.domain;
    } else {
        d = domain.create();
    }
    d.add(req);
    d.add(res);
    d.on('error', function(err) {
        console.error('uncaughtException url=%s, msg=%s', req.url, err.stack || err.message || err);
        if(!res.finished) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json; charset=UTF-8');
            res.end('uncaughtException');
        }
    });
    d.run(next);
});

app.get('/', function(req, res) {
    res.render('index', { currentTime: new Date() });
});

// 可以将一类的路由单独保存在一个文件中
app.use('/todos', todos);

// 如果任何路由都没匹配到，则认为 404
// 生成一个异常让后面的 err handler 捕获
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) { // jshint ignore:line
        var statusCode = err.status || 500;
        if(statusCode === 500) {
            console.error(err.stack || err);
        }
        res.status(statusCode);
        res.render('error', {
            message: err.message || err,
            error: err
        });
    });
}

// 如果是非开发环境，则页面只输出简单的错误信息
app.use(function(err, req, res, next) { // jshint ignore:line
    res.status(err.status || 500);
    res.render('error', {
        message: err.message || err,
        error: {}
    });
});

module.exports = app;
//module.exports = app;
