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
        sprint_q.descending("createAt");
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
