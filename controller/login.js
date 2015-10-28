/**
 * Created by yaotaiyang on 2014/8/31.
 */
var users=require("../models/users");
var qs = require("querystring");
var fs = require("fs");
var init=function(req,res){
    res.render("login",{});
}
var post=function(req,res){
    var pass=false;
    req.addListener("data",function(postdata){
        var b=qs.parse(""+postdata);
        if(users[b.username]&&users[b.username].password== b.password){
            pass=true;
        }
    });
    req.addListener("end",function(){
        if(pass){
            req.session.login=1;
            res.redirect("/admin");
        }else{
            res.redirect("/login");
        }
    });
}
exports.init=init;
exports.post=post;
