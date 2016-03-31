/**
 * Created by yaoxy on 2015/10/30.
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
    var resobj = {title:"首页",teamId:teamId,sprintId:sprintId};
    var sprint_q = new AV.Query(Sprint);
    sprint_q.equalTo("teamId", teamId);
    sprint_q.notEqualTo("deleted", "1");
    sprint_q.addDescending("isDefault");
    sprint_q.find().then(function(data){
        resobj.sprints=[];
        data.forEach(function(obj){
            resobj.sprints.push({name:obj.get("name"),id:obj.id});
            if(obj.id == sprintId){
                resobj.curSprint = obj;
            }
        });
        var cur_teams = user.get("teams"),teamIds = [];
        cur_teams.forEach(function(team){
            teamIds.push(team.teamId);
        });
        var Team = AV.Object.extend('Team');
        var team_q = new AV.Query(Team);
        team_q.containedIn('objectId',teamIds);
        return team_q.find({success:function(data){
            return data;
        }})
    }).then(function(data){ //获取
        resobj.teams = data;
        var q_user = new AV.Query(AV.User);
        var companyId = user.get("companyId");
        q_user.equalTo("companyId", companyId);
        q_user.notEqualTo("role", 'superAdmin');
        return q_user.find({
            success: function(data) {
                return data;
            },error:function(){
                obj.render(req,res,{data:{err:{}}});
            }
        })
    }).then(function(data){
        resobj.teamPeople = [];
        data.forEach(function(obj){
            var cur_teams = obj.get("teams"),isteampeo = 0;
            for(var i=0;i<cur_teams.length;i++){
                if(cur_teams[i].teamId == teamId){
                    isteampeo = 1;
                    break;
                }
            }
            if(isteampeo == 1){
                resobj.teamPeople.push(obj);
            }
        });
    }).then(function(){
        var team_q = new AV.Query(Team);
        team_q.get(teamId).then(function(data){
            resobj.curTeam=data;
            obj.render(req,res,{template:"index",data:resobj});
        });
    });
}
exports.init=init;