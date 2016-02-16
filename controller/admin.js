/**
 * Created by yaoxy on 2016/1/21.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var user = AV.User.current();
    var Company = AV.Object.extend('Company');
    if(user.get("role") != "admin"){
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
            renderObj.company = company;
        },
        error:function(){
            res.redirect('/');
        }
    }).then(function(){
        var teams = [];
        user.get("teams").forEach(function(team){
            teams.push(team.teamId);
        });
        var Sprint = AV.Object.extend('Sprint');
        var sprint_q = new AV.Query(Sprint);
        sprint_q.containedIn('teamId',teams);
        sprint_q.addDescending("createdAt");
      /*  sprint_q.addDescending("isDefault");
        sprint_q.descending("createAt");*/
        sprint_q.find({ //获取冲刺信息
            success:function(data){
                renderObj.sprints=data;
                obj.render(req,res,{template:"admin",data:renderObj});
            },
            error:function(){
                obj.render(req,res,{data:{title:"获取数据失败",err:{}}});
            }
         });
    });
}
exports.init=init;
