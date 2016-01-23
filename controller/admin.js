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
            obj.render(req,res,{template:"admin",data:renderObj});
    });
}
exports.init=init;
