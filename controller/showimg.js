/**
 * Created by yaoxy on 2016/4/24.
 */
function init(req,res,obj){
    obj.render(req,res,{template:"showimg",data:{title:"查看图片"}});
}
exports.init=init;