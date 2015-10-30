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
    var cur_data = {urlParams : req.query,title:"首页"};
	cur_data.str_data = JSON.stringify(cur_data);
    res.render('index',cur_data);
});
module.exports = router;
