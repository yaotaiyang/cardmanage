/**
 * Created by yaoxy on 2016/1/25.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var teamId = req.query["teamId"];
    var user = AV.User.current();
    var teams = user.get("teams");
    var cur_teamId= teams[0].teamId;
    if(!teamId){
        res.redirect('/?teamId='+cur_teamId);
        return;
    };
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
    var sprintId = req.query["sprintId"];
    var Card = AV.Object.extend('Card');
    var Team = AV.Object.extend('Team');
    var Sprint = AV.Object.extend('Sprint');
    var resobj = {title:"统计",teamId:teamId,sprintId:sprintId};
    var sprint_q = new AV.Query(Sprint);
    sprint_q.equalTo("teamId", teamId);
    sprint_q.descending("createAt");
    sprint_q.find({ //获取冲刺信息
        success: function(data) {
            resobj.sprints=[];
            data.forEach(function(obj){
                resobj.sprints.push({name:obj.get("name"),id:obj.id});
                if(obj.id == sprintId){
                    resobj.curSprint = obj;
                }
            });
            resobj.teams = user.get("teams");
        },
        error: function(object, error) {
            resobj.err = error;
            obj.render(req,res,resobj);
        }
    }).then(function(){ //获取
        var q_user = new AV.Query(AV.User);
        var companyId = user.get("companyId");
        q_user.equalTo("companyId", companyId);
        q_user.find({
            success: function(data) {
                resobj.teamPeople = [];
                data.forEach(function(obj){
                    var cur_teams = obj.get("teams"),isteampeo = 0;
                    for(var i=0;i<cur_teams.length;i++){
                        if(cur_teams[i].teamId == teamId){
                            isteampeo = 1;
                            break;
                        }
                    }
                    resobj.teamPeople.push(obj);
                });
            },error:function(){
                obj.render(req,res,{data:{err:{}}});
            }
        }).then(function(){
            var team_q = new AV.Query(Team);
            team_q.get(teamId).then(function(data){
                resobj.curTeam=data;
                obj.render(req,res,{template:"statistics",data:resobj});
            });
        });
    });
}
exports.init=init;