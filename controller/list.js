/**
 * Created by yaotaiyang on 2014/8/4.
 */
var init=function(req,res){
    var db=require("../models/db");
    db.find(function(docs){
        res.render("list",{pageData:docs});
    },function(err){console.log(err)});
}
exports.init=init;