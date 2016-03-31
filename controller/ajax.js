/**
 * Created by yaoxy on 2015/11/1.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var type = req.query["type"];
    function err(error){ //错误返回统一方法
        obj.render(req,res,{data:{title:"修改失败",err:error}});
    }
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
                        var cur_item  = cardHash[key];
                        resarr.push(cur_item);
                    }
                    obj.render(req, res, {data: resarr});
                    return;
                },
                error:err
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
        card.set("createdBy",{"userId": cur_user.id,"displayName":cur_user.get("displayName")});
        card.set("title",req.body.title);
        card.set("type",req.body.type);
        card.set("description",req.body.description);
        card.set("parentId",req.body.parentId);
        card.set("amount",Number(req.body.amount));
        card.set("startTime",req.body.startTime);
        card.set("endTime",req.body.endTime);
        card.set("weight",Number(req.body.weight));
        card.set("acceptance",req.body.acceptance||"");
        card.set("owners",req.body.owners);
        card.set("cardClass",req.body.cardClass);
        card.set("images",req.body.images);
        card.set("tags",req.body.tags);
        card.set("type",req.body.type);
        card.save({
            success:function(data){
                obj.render(req,res,{data:data});
            },
            error:err
        });
    }else if(type=="update-card"){
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
            card.set("parentId",req.body.parentId);
            card.set("cardClass",req.body.cardClass);
            card.set("weight",Number(req.body.weight));
            card.set("acceptance",req.body.acceptance||"");
            card.set("images",req.body.images);
            card.set("tags",req.body.tags);
            if(req.body.sprintId == card.get("sprintId")){
                card.save({success:function(data){
                    obj.render(req,res,{data:data});
                },error:err});
            }else{
                //修改了冲刺，关联的card都要修改
                var sql  = "select * from Card where parentId='"+cardId+"' or objectId = '"+cardId+"'";
                AV.Query.doCloudQuery(sql).then(function(listdata) {
                    var results = listdata.results;
                    results.forEach(function(cur_card){
                        cur_card.set("sprintId",req.body.sprintId);
                    });
                    AV.Object.saveAll(results, {
                        success: function(data) {
                            obj.render(req,res,{data:data});
                        },
                        error:err
                    });
                }, err);
            }

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
                },error:err});
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
            },error:err});
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
            },error:err
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
        comment.set("createdBy",{"objectId":user.id,"displayName":user.get("displayName")});
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
    } else if(type=="add-user"){
        var username = req.body.username,password=req.body.password,displayName=req.body.displayName,email= req.body.email;
        if(!(username&&password&&displayName)){
            obj.render(req,res,{data:{title:"参数不正确",err:{}}});
            return;
        };
        var teamId = req.query["teamId"];
        var cur_user = AV.User.current();
        var companyId = AV.User.current().get("companyId");
        var teams = [];
        cur_user.get("teams").forEach(function(team){
            if(team["teamId"]==teamId){
                teams.push(team);
            }
        });
        var user = new AV.User();
        user.set('username', username);
        user.set('password', password);
        user.set('companyId', companyId);
        user.set('teams',teams);
        user.set("email",email);
        user.set('displayName',displayName);
        user.save().then(function(user){
            obj.render(req,res,{data:user});
        },err);
    }else if(type=="update-user"){
        var cur_user = AV.User.current();
        if(cur_user.get("companyId")!=req.body.companyId){
            obj.render(req,res,{data:{title:"无权修改",err:{message:"无权修改"}}});
        }
        AV.Cloud.useMasterKey();
        var username = req.body.username,password=req.body.password,displayName=req.body.displayName,email = req.body.email,teams = req.body.teams;
        var companyId = req.body.companyId,id = req.body.objectId;
        if(!(username&&displayName)){
            obj.render(req,res,{data:{title:"参数不正确",err:{}}});
            return;
        };
        //所在项目去重
        var teamobj ={},temp_arr= [];
        for(var i = 0;i<teams.length;i++){
            if(!teamobj[teams[i].teamId]){
                teamobj[teams[i].teamId]=teams[i];
                temp_arr.push(teams[i]);
            }
        }
        var user_q = new AV.Query(AV.User);
        user_q.get(id).then(function(user){
            user.set("username",username);
            user.set("displayName",displayName);
            user.set("email",email);
            user.set("teams",temp_arr);
            if(password!=undefined && password.length){
                user.set("password",password);
            }
            user.save().then(function(user_r){
                obj.render(req,res,{data:user_r});
            },err);
        },err);
    }else if(type=="add-sprint"){
        var name = req.body.name,teamId = req.body.teamId;
        var cur_user = AV.User.current();
        var companyId = cur_user.get("companyId");
        if(!(name&&teamId)){
            obj.render(req,res,{data:{title:"参数不正确",err:{message:"参数不正确"}}});
            return;
        };
        var Sprint = AV.Object.extend('Sprint');
        var sprint = new Sprint();
        sprint.set("companyId",companyId);
        sprint.set("teamId",teamId);
        sprint.set("name",name);
        sprint.save().then(function(cur_sprint){
            obj.render(req,res,{data:cur_sprint});
        },err);
    }else if(type=="update-sprint"){
        var name = req.body.name,id=req.body.objectId,deleted = req.body.deleted,isDefault = req.body.isDefault;
        if(!(name)){
            obj.render(req,res,{data:{title:"参数不正确",err:{message:"参数不正确"}}});
            return;
        };
        var Sprint = AV.Object.extend('Sprint');
        var sprint_q = new AV.Query(Sprint);
        sprint_q.get(id,function(cur_sprint){
            cur_sprint.set("name",name);
            cur_sprint.set("deleted",deleted);
            cur_sprint.set("isDefault",isDefault);
            cur_sprint.save().then(function(new_sprint){
                obj.render(req,res,{data:new_sprint});
            },err);
        },err);
    }else if(type == 'add-team'){
        var name = req.body.name;
        var cur_user = AV.User.current();
        var companyId = cur_user.get("companyId");
        if(!(name)){
            obj.render(req,res,{data:{title:"参数不正确",err:{message:"参数不正确"}}});
            return;
        };
        var Team = AV.Object.extend('Team');
        var team = new Team();
        team.set("companyId",companyId);
        team.set("name",name);
        team.save().then(function(cur_team){
            cur_user.get("teams").push({"teamId":cur_team.id});
            cur_user.save().then(function(team){
                obj.render(req,res,{data:cur_team});
            },err);
        },err);
    }else if(type == 'update-team'){
        var name = req.body.name,id=req.body.objectId,tags = req.body.tags;
        var Team = AV.Object.extend('Team');
        var team = new AV.Query(Team);
        team.get(id,function(team){
            if(name){
                team.set("name",name);
            }
            if(tags){
                team.set("tags",tags);
            }
            team.save().then(function(cur_team){
                obj.render(req,res,{data:cur_team});
            },err);
        },err);
    }else{
        obj.render(req,res,{data:{title:"登录失败",err:{message:"该接口不存在"}}});
    }
}
exports.init=init;