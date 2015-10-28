/**
 * Created by yaotaiyang on 2014/8/4.
 */
var init=function(req,res){
    var db=require("../models/db");
    console.log(req.session.login);
    if(req.session.login){
        db.find(function(docs){
            res.render("admin",{pageData:docs});
        },function(err){console.log(err)});
    }else{
        res.redirect("/login");
    }
}
exports.init=init;