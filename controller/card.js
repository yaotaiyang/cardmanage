/**
 * Created by yaoxy on 2015/11/2.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var teamId = req.query.teamId;
    var sprintId = req.query.sprintId;
    var user =  AV.User.current();
    var companyId = user.get("companyId");
    var cardId = req.query.cardId;
    var user_q = new AV.Query(AV.User);
    user_q.equalTo("companyId",companyId);
    var teamP=[];
    user_q.find({
        success:function(data){
            data.forEach(function(obj){
                var cur_teams = obj.get("teams");
                if(cur_teams){
                    for(var i=0;i<cur_teams.length;i++){
                        var cur_team = cur_teams[i];
                        if(cur_team.teamId == teamId){
                            teamP.push(obj);
                            break;
                        }
                    }
                }
            });
            donext();
        },
        error:function(){

        }
    });
    function donext(){
        if(cardId){

        }else{
            obj.render(req,res,{template:"card",data:{title:"添加卡片",teams:teamP}});

        }
    }
}
exports.init=init;