/**
 * Created by yaoxy on 2015/10/30.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var Card = AV.Object.extend('Card');
    var query = new AV.Query(Card);
    query.descending("updatedAt");
    query.find({
        success: function(data) {
            obj.render(req,res,{template:"index",data:{title:"首页",datalist:data}});
        },
        error: function(object, error) {
            console.log(object);

        }
    });
}
exports.init=init;