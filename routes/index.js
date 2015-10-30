/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-28
 * Time: 下午9:41
 * To change this template use File | Settings | File Templates.
 */
var express = require('express');
var router = express.Router();
module.exports=function(router){
    router.get('/',function(req,res){
        res.render('index');
    });
}
