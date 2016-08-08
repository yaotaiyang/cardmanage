/**
 * Created by yaoxy on 2016/7/1.
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
    var resobj = {title:"用户反馈"};
    var companyId = user.get("companyId");
    var Team = AV.Object.extend('Team');
    var team_q = new AV.Query(Team);
    team_q.get(teamId).then(function(data){
        return resobj.curTeam = data;
    }).then(function(){
        var Sprint = AV.Object.extend("Sprint");
        var sprint_q = new AV.Query(Sprint);
        sprint_q.equalTo("teamId",teamId);
        return sprint_q.find();
    }).then(function(data){
        resobj.sprintList = data;
        var storyHash ={};
        var list = [];
        data.forEach(function(obj){
            list.push(obj.id);
        });
        //return list;
        var Card = AV.Object.extend('Card');
        var card_q = new AV.Query(Card);
        card_q.containedIn("sprintId",list);
        card_q.equalTo("type","story");
        return card_q.find().then(function(data){
            data.forEach(function(item){
                var cur_id = item.get("sprintId");
                if(!storyHash[cur_id]){
                    storyHash[cur_id]=[];
                }
                storyHash[cur_id].push(item);
            });
            resobj.hashStory = storyHash;
            return data;
        });
    }).then(function(data){
        var Feedback = AV.Object.extend('Feedback');
        var feedback_q = new AV.Query(Feedback);
        feedback_q.equalTo('teamId', teamId);
        return feedback_q.find();
    }).then(function(data){
        var card_list = [];
        data.forEach(function(fd){
            var relaId = fd.get("relatedCard");
            if(relaId){
                card_list.push(relaId);
            }
        });
        var Card = AV.Object.extend('Card');
        var card_q = new AV.Query(Card);
        card_q.containedIn("objectId",card_list);
        resobj.feedbackList = data;
        resobj.company={name: "明源移动事业部"};
        return card_q.find().then(function(data){
            resobj.hashRelateCardList={};
            if(data && data.length){
                data.forEach(function(obj){
                    resobj.hashRelateCardList[obj.get("oriCardId")]=obj;
                });
            }
            return data;
        });
    }).then(function(){
        obj.render(req,res,{template:"feedback",data:resobj});
    })
};
exports.init=init;