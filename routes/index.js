/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-28
 * Time: 下午9:41
 * To change this template use File | Settings | File Templates.
 */
var express = require('express');
var router = express.Router();
router.get('/',function(req,res){
    var controller = require('../controller/index.js');
    controller.init(req,res,render);
});
function render(req,res,data,tempPath){
    var data = data;
    data.str_data = JSON.stringify(data);
    res.render(tempPath,data);
}
module.exports = router;
