/**
 * Created by yaoxy on 2015/10/30.
 */
function init(req,res,obj){
    var cur_data={title:"首页"};
    cur_data.str_data = JSON.stringify(cur_data);
    var path = "index";
    obj.render(req,res,{path:path,data:cur_data});
}
exports.init=init;