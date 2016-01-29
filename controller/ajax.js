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
        card_q.notEqualTo('deleted', '1');
        var Team = AV.Object.extend('Team');
        var team_q = new AV.Query(Team);
        var cardType = [];
        team_q.get(teamId,function(team_obj){
            cardType = team_obj.get("cardType");
        }).then(function(){
            card_q.find({
                success:function(data) {
                    var cardHash = {};
                    var resarr = [];
                    data.forEach(function (obj,ind) {
                        if (obj.get("type") != "story") {
                            if(!cardHash[obj.get("parentId")]){
                                cardHash[obj.get("parentId")] = {
                                    cards:[]
                                };
                                cardType.forEach(function(name){
                                    cardHash[obj.get("parentId")].cards.push({"type":name,list:[]});
                                });
                            }
                            var lineobj = cardHash[obj.get("parentId")];
                            for(var i=0;i<lineobj.cards.length;i++){
                                if(lineobj.cards[i].type == obj.get("type")){
                                    lineobj.cards[i].list.push(obj);
                                    break;
                                }
                            }
                        }
                    });
                    data.forEach(function (obj) {
                        if (obj.get("type") == "story") {
                            if(!cardHash[obj.id]){
                                cardHash[obj.id] = {
                                    cards:[]
                                };
                                cardType.forEach(function(name){
                                    cardHash[obj.id].cards.push({"type":name,list:[]});
                                });
                            }
                            cardHash[obj.id].story = obj;
                        }
                    });
                    for(var key in cardHash){
                        resarr.push(cardHash[key]);
                    }
                    obj.render(req, res, {data: resarr});
                    return;
                },
                error:function(){
                    obj.render(req,res,{data:{title:"获取数据失败",err:{}}});
                }
            });
        });
    }else if(type=="add-card"){
        var teamId = req.query["teamId"];
        var sprintId = req.query["sprintId"];
        var cur_user = AV.User.current();
        var Card = AV.Object.extend('Card');
        var card = new Card();
        card.set("teamId",teamId);
        card.set("sprintId",sprintId);
        card.set("companyId",cur_user.get("companyId"));
        card.set("createdBy",{"userId": cur_user.id,"userName":cur_user.get("username")});
        card.set("title",req.body.title);
        card.set("type",req.body.type);
        card.set("description",req.body.description);
        card.set("parentId",req.body.parentId);
        card.set("amount",Number(req.body.amount));
        card.set("startTime",req.body.startTime);
        card.set("endTime",req.body.endTime);
        card.set("weight",Number(req.body.weight));
        card.set("owners",req.body.owners);
        card.set("cardClass",req.body.cardClass);
        card.set("images",req.body.images);
        card.set("type",req.body.type);
        card.save({
            success:function(data){
                obj.render(req,res,{data:data});
            },
            error:function(){
                obj.render(req,res,{data:{title:"添加失败",err:{}}});
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
            card.set("amount",Number(req.body.amount));
            card.set("startTime",req.body.startTime);
            card.set("endTime",req.body.endTime);
            card.set("realAmount",Number(req.body.realAmount));
            card.set("owners",req.body.owners);
            card.set("cardClass",req.body.cardClass);
            card.set("weight",Number(req.body.weight));
            card.set("images",req.body.images);
            card.save({success:function(data){
                obj.render(req,res,{data:data});
            },error:function(){
                obj.render(req,res,{data:{title:"保存失败",err:{}}});
            }});
        });
    } else if(type=="del-card"){
        var cardId = req.query["cardId"];
        var cur_user = AV.User.current();
        var Card = AV.Object.extend('Card');
        var card_q = new AV.Query(Card);
        card_q.get(cardId,function(card){
            if(card.get("createdBy").userId == cur_user.id){
                card.set("deleted","1");
                card.save({success:function(data){
                    if(card.get("type")=="story"){
                        var card_lq = new AV.Query(Card);
                        card_lq.equalTo("parentId",cardId);//删除子卡片
                        card_lq.find().then(function(list){
                            if(list.length>0){
                                AV.Object.destroyAll(list).then(function(){
                                    obj.render(req,res,{data:data});
                                },function(){
                                    obj.render(req,res,{data:{title:"删除失败",err:{}}});
                                });
                            }else{
                                obj.render(req,res,{data:data});
                            }
                        },function(){
                            obj.render(req,res,{data:{title:"删除失败",err:{}}});
                        });
                    }else{
                        obj.render(req,res,{data:data});
                    }
                },error:function(){
                    obj.render(req,res,{data:{title:"删除失败",err:{}}});
                }});
            }else{
                obj.render(req,res,{data:{title:"无权删除",err:{}}});
            }
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