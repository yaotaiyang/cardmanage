/**
 * Created by yaoxy on 2015/10/31.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var username = req.body.username;
    var password = req.body.password;
    var code = req.body.code;
    if (!username || username.trim().length == 0 || !password || password.trim().length == 0) {
        obj.render(req,res,{template:"register",data:{title:"注册失败",err:{message:"用户名或密码不能为空"}}});
        return;
    }
    if(code != "card_register_code"){
        obj.render(req,res,{template:"register",data:{title:"注册失败",err:{message:"注册码不正确"}}});
        return;
    }
    var Company = AV.Object.extend("Company");
    var comp = new Company();//创建系统管理员前，先创建公司
    comp.save({name:username},{
        success:function(data){
            var user = new AV.User();
            user.set("username", username);
            user.set("password", password);
            user.signUp({"role":"admin",companyId:data.id}, {
                success: function(user) {
                    res.redirect('/');
                },
                error: function(user, err) {
                    obj.render(req,res,{template:"register",data:{title:"注册失败",err:err}});
                }
            })
        },
        error: function() {
            obj.render(req,res,{template:"register",data:{title:"注册失败",err:{message:"网络错误，稍后重试"}}});
        }
    });

}
exports.init=init;