/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-30
 * Time: 下午9:38
 * To change this template use File | Settings | File Templates.
 */
var express=require("express");
var router=require("./routes");
var cookieParser=require('cookie-parser');
var session = require('express-session');
var template = require('ejs');
var path=require("path");
var app=express();
app.engine('.html', template.__express);
app.set('view engine', 'html');
//app.set("views",__dirname+"/views");
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());app.use(session({saveUninitialized: true, resave:true, secret: 'website', cookie: { maxAge: 60000 }}));
router(app);
app.listen(3000);
