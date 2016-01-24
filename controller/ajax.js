/**
 * Created by yaoxy on 2015/11/1.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var type = req.query["type"];
    if(type =="get-card-list"){
        var teamId = req.query["teamId"];
        var sprintId = req.query["sprintId"];
        var Card = AV.Object.extend('Card');
        var card_q = new AV.Query(Card);
        card_q.equalTo("teamId", teamId);
        card_q.equalTo("sprintId", sprintId);
        card_q.find({
            success:function(data){
                var Team = AV.Object.extend('Team');
                var team_q = new AV.Query(Team);
                team_q.get(teamId,function(team_obj){
                    var cur_arr =[];
                    team_obj.get("cardType").forEach(function(name){
                        var cur_obj = {type:name,list:[]};
                        var ispush = 0;
                        data.forEach(function(card){
                            if(card.get("type") == name){
                                ispush =1;
                                cur_obj.list.push(card);
                            }
                        });
                        cur_arr.push(cur_obj);
                    });
                    obj.render(req,res,{data:cur_arr});
                });
            },
            error:function(user, err){
                obj.render(req,res,{data:{title:"登录失败",err:err}});
            }
        });
    }else if(type=="add-card"){
        var teamId = req.query["teamId"];
        var sprintId = req.query["sprintId"];
        var Card = AV.Object.extend('Card');
        var card = new Card();
        card.set("teamId",teamId);
        card.set("sprintId",sprintId);
        card.set("companyId",AV.User.current().get("companyId"));
        card.set("title",req.body.title);
        card.set("type",req.body.type);
        card.set("description",req.body.description);
        card.set("amount",req.body.amount);
        card.set("owners",req.body.owners);
        card.set("images",req.body.images);
        card.set("type",req.body.type);
        card.save({
            success:function(data){
                obj.render(req,res,{data:data});
            }
        });
    }else if(type=="updata-card"){
        var teamId = req.query["teamId"];
        var sprintId = req.query["sprintId"];
        var cardId = req.query["cardId"];
        var Card = AV.Object.extend('Card');
        var card_q = new AV.Query(Card);
        card_q.get(cardId,function(card){
            card.set("title",req.body.title);
            card.set("description",req.body.description);
            card.set("amount",req.body.amount);
            card.set("owners",req.body.owners);
            card.set("images",req.body.images);
            card.save({success:function(data){
                obj.render(req,res,{data:data});
            },error:function(){
                obj.render(req,res,{data:{title:"登录失败",err:{}}});
            }});
        });
    }
    else if(type=="card-move"){
        var newType = req.query["newType"];
        var cardId = req.query["cardId"];
        var Card = AV.Object.extend('Card');
        var card_q = new AV.Query(Card);
        card_q.get(cardId,function(card){
            card.set("type",newType);
            card.save({success:function(data){
                obj.render(req,res,{data:data});
            },error:function(){
                obj.render(req,res,{data:{title:"登录失败",err:{}}});
            }});
        });
    }else if(type=="get-people"){
        var q_user = new AV.Query(AV.User);
        var teamId = req.query["teamId"];
        var companyId = AV.User.current().get("companyId");
        q_user.equalTo("companyId", companyId);
        q_user.find({
            success: function(data) {
                var peopleList = [];
                data.forEach(function(obj){
                    var teams = obj.get("teams");
                    if(teams){
                        for(var i=0;i<teams.length;i++){
                            if(teams[i]["teamId"]==teamId){
                                peopleList.push(obj);
                                break;
                            }
                        }
                    }
                });
                obj.render(req,res,{data:peopleList});
            },error:function(){
                obj.render(req,res,{data:{err:{}}});
            }
        });
    }else if(type=="get-comments"){
        var cardId = req.query["cardId"];
        var Comments = AV.Object.extend('Comment');
        var comments =  new AV.Query(Comments);
        comments.equalTo('cardId',cardId);
        comments.notEqualTo('deleted', '1');
        comments.find(function(data){
            obj.render(req,res,{data:data});
        });
    }else if(type=="add-comment"){
        var description = req.query["description"];
        var hasComments = req.query["hasComments"];
        var user = AV.User.current();
        var Card = AV.Object.extend('Card');
        var card = new AV.Query(Card);
        var cardId = req.query["cardId"];
        var Comments = AV.Object.extend('Comment');
        var comment = new Comments();
        comment.set("description",description);
        comment.set("cardId",cardId);
        comment.set("createdBy",{"objectId":user.id,"username":user.get("username")});
        comment.save().then(function(data){
            if(hasComments!=1){
                card.get(cardId).then(function(rescard){
                    rescard.set("hasComments","1");
                    rescard.save().then(function(){
                        obj.render(req,res,{data:data});
                    },function(){
                        obj.render(req,res,{data:{title:"更新卡片状态失败",err:{}}});
                    });
                });
            }else{
                obj.render(req,res,{data:data});
            }
        },function(){ obj.render(req,res,{data:{title:"保存评论失败",err:{}}})});
    }
    else{
        obj.render(req,res,{data:{title:"登录失败",err:{}}});
    }
}
exports.init=init;