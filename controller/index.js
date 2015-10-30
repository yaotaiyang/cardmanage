/**
 * Created by yaoxy on 2015/10/30.
 */
function init(req,res,render){
    var cur_data={title:"首页"};
    cur_data.str_data = JSON.stringify(cur_data);
    var tempPath = "index";
    render(req,res,cur_data,tempPath);
}
exports.init=init;