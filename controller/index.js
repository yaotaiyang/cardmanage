/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-8-1
 * Time: 上午10:19
 * To change this template use File | Settings | File Templates.
 */
function init(req,res){
    res.render("index",{"user":"yaotaiyang"});
}
exports.init=init;
