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
var APP_ID = 'klov2drpvsq48w352mts7oa4xbjovisvu8xp0vzrq1dslrdp'; // your app id
var APP_KEY = '81ov9vy8pou5hpp1t34jkjworg8juq8sfzf0hba51o0a39rt'; // your app key
var MASTER_KEY =  'oirmw2qt44e833pj1sjon95ws3jubnhprjcza3gnrasjaw0x'; // your app master key
AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
router.get('/',function(req,res){
    var controller = require('../controller/index.js');
    controller.init(req,res,{render:render,av:AV});
});
function render(req,res,obj){
    var data = obj.data;
    data.str_data = JSON.stringify(data);
    res.render(obj.path,data);
}
module.exports = router;
