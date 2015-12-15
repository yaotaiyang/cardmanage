/**
 * Created by yaoxy on 2015/10/30.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var Card = AV.Object.extend('Card');
    var Sprint = AV.Object.extend('Sprint');
    var user = AV.User.current();
    var cur_teamId= user.get("teams")[0].teamId;
    var resobj = {title:"首页"};
    var sprint_q = new AV.Query(Sprint);
    sprint_q.equalTo("teamId", cur_teamId);
    sprint_q.descending("createAt");
    sprint_q.find({
        success: function(data) {
            resobj.sprints=[];
            data.forEach(function(obj){
                resobj.sprints.push({name:obj.get("name"),id:obj.id});
            });
            resobj.teams = user.get("teams");
            obj.render(req,res,{template:"index",data:resobj});
            return;
        },
        error: function(object, error) {
            resobj.err = error;
            obj.render(req,res,resobj);
            return;
        }
    })
}
exports.init=init;