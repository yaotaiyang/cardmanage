/**
 * Created by yaoxy on 2016/7/1.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var Feedback = AV.Object.extend('Feedback');
    var feedback= new Feedback();
    console.log(req.body);
    if(req.body.teamId && req.body.images && req.body.feedbackid){
        console.log("bed");
        feedback.set("description",req.body.description);
        feedback.set("teamId",req.body.teamId);
        feedback.set("feedbackid",req.body.feedbackid);
        feedback.set("images",req.body.images||[]);
        feedback.save().then(function(data){
            obj.render(req,res,{data:data});
        });
    }else{
        obj.render(req,res,{err:"参数不正确"});
    }
};
exports.init=init;