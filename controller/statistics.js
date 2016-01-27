/**
 * Created by yaoxy on 2016/1/25.
 */
function init(req,res,obj){
    var AV= obj.AV;
    var resobj = {title:"统计"};
    var Card = AV.Object.extend('Card');
    var Sprint = AV.Object.extend('Sprint');
    var user = AV.User.current();
    var teamId = req.query["teamId"];
    var sprintId = req.query["sprintId"];
    var sprint_q = new AV.Query(Sprint);
    var ownerTeams = user.get("teams");
    var inteam = 0;
    for(var i=0;i<ownerTeams.length;i++){
        if(ownerTeams[i].teamId == teamId){
            inteam = 1;
            break;
        }
    }
    if(inteam!=1){
        obj.render(req,res,{template:"statistics",data:{title:"无权查看"}});
        return;
    }
    sprint_q.get(sprintId).then(function(data){
        resobj.sprint = data;
        resobj.title = data.name;
    }).then(function(){
        var card_q = new AV.Query(Card);
        card_q.equalTo("sprintId", sprintId);
        card_q.notEqualTo('deleted', '1');
        card_q.find().then(function(data){
            resobj.cards = data;
        }).then(function(){
            obj.render(req,res,{template:"statistics",data:resobj});
        });
    });
}
exports.init=init;