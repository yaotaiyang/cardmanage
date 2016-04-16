/**
 * Created by yaoxy on 2016/4/15.
 */
var fs = require('fs');
function init(req,res,obj){
    var AV= obj.AV;
    var teamId = req.query["teamId"];
    var user = AV.User.current();
    var teams = user.get("teams");
    var allow = 0;
    for(var i=0;i<teams.length;i++){
        if(teams[i].teamId == teamId){
            allow = 1;
        }
    }
    if(allow!=1){
        //校验权限
        res.redirect('/logout');
    }
    var resobj = {title:"公告"};
    var companyId = user.get("companyId");
    var Team = AV.Object.extend('Team');
    var team_q = new AV.Query(Team);
    team_q.get(teamId).then(function(data){
        resobj.curTeam = data;
        return data;
    }).then(function(data){
        var arr_noticeid = data.get("notices");
        var Notice = AV.Object.extend('Notice');
        var notice_q = new AV.Query(Notice);
        notice_q.containedIn('objectId',arr_noticeid);
        return notice_q.find().then(function(data){
            resobj.notices = data;
            return data;
        });
    }).then(function(){
        /*var Company = AV.Object.extend('Company');
        var company_q = new AV.Query(Company);
        return company_q.get(user.get("companyId")).then(function(data){
            resobj.company = data;
            return data;
        });*/
        resobj.company={name: "明源移动事业部"};
    }).then(function(){
        obj.render(req,res,{template:"notice",data:resobj});
    })
};
exports.init=init;