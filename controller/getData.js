/**
 * Created by yaoxy on 2016/7/12.
 */
var getData = {
    getCardList:function(req,res,obj){
        var AV= obj.AV,pageNum=30;
        var teamId = req.query["teamId"];
        var type= req.query["card-type"];
        var sprintId = req.query["sprintId"];
        var page = req.query["page"];
        var tag = req.query["tag"];
        var isBook = req.query["isBook"];
        var Card = AV.Object.extend('Card');
        var card_q = new AV.Query(Card);
        card_q.equalTo("teamId", teamId);

        sprintId && card_q.equalTo("sprintId", sprintId);
        type && card_q.equalTo("type",type);
        tag && card_q.equalTo("tags",tag);

        card_q.notEqualTo('deleted', '1');
        if(typeof isBook =="string"){
            if(isBook == '1'){
                card_q.equalTo('isBook',isBook);
            }else{
                card_q.notEqualTo('isBook','1');
            }
        }
        card_q.descending('weight');
        //card_q.descending('createdAt');
        return card_q.count().then(function(count){
          return count;
        }).then(function(count){
            var res = {
                count:count
            };
            if(page){
                card_q.limit(pageNum);
                card_q.skip(pageNum*(page-1));
            }else{
                card_q.limit(1000);
            }
            return card_q.find().then(function(data){
                res.list = data;
                res.curPage = parseInt(page);
                res.pages = Math.ceil(res.count / pageNum);
                res.pageNum = pageNum;
                return res;
            },function(){});
        });

    }
};
//export default getData;
exports.getData=getData;