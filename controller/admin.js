/**
 * Created by yaoxy on 2016/1/21.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var user = AV.User.current();
    var Company = AV.Object.extend('Company');
    if(user.get("role") != "admin" && user.get("role") != "superAdmin"){
        res.redirect('/');
    }
    var teamId = req.query["teamId"];
    var teams = user.get("teams");
    var cur_teamId= teams[0].teamId;
    if(!teamId){
        res.redirect('admin/?teamId='+cur_teamId);
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
    var renderObj = {
        title:"后台管理",
        user:AV.User.current()
    };
    var company_q = new AV.Query(Company);
    company_q.get(user.get("companyId"),{
        success:function(company){
            return company;
        },
        error:function(){
            res.redirect('/');
        }
    }).then(function(company){
        renderObj.company = company;
        var Sprint = AV.Object.extend('Sprint');
        var sprint_q = new AV.Query(Sprint);
        sprint_q.equalTo('teamId',teamId);
        sprint_q.addDescending("createdAt");
      /*  sprint_q.addDescending("isDefault");
        sprint_q.descending("createAt");*/
        return sprint_q.find({ //获取冲刺信息
            success:function(data){
                return data;
            },
            error:function(){
                obj.render(req,res,{data:{title:"获取数据失败",err:{}}});
            }
         })
    }).then(function(data){
        renderObj.sprints=data;
        var q_user = new AV.Query(AV.User);
        var companyId = AV.User.current().get("companyId");
        q_user.equalTo("companyId", companyId);
        q_user.notEqualTo("role", "superAdmin");
        return q_user.find({
            success: function(data) {
                return data;
            },error:function(error){
                obj.render(req,res,{data:{title:"获取数据失败",err:error}});
            }
        });
    }).then(function(data){
        var peopleList = [];
        var companyId = AV.User.current().get("companyId");
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
        renderObj.teamPeople = peopleList;//团队人员
        renderObj.companyPeople=data;//公司人员
        if(user.get("role")=='superAdmin'){
            var Team = AV.Object.extend('Team');
            var team_q = new AV.Query(Team);
            team_q.equalTo('companyId',companyId);
            team_q.find({
                success:function(data){
                    renderObj.companyTeams = data;
                    obj.render(req,res,{template:"admin",data:renderObj});
                },
                error:function(error){
                    obj.render(req,res,{data:{title:"获取数据失败",err:error}});
                }
            });
        }else{
            obj.render(req,res,{template:"admin",data:renderObj});
        }
    });
}
exports.init=init;
