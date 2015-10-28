var mongodb=require("mongodb");
var server=new mongodb.Server("localhost",27017,{auto_reconnect:true});
var db=new mongodb.Db("mydb",server,{safe:true});
var dbop={};
dbop.open=function(suc,error){
    db.open(function(err,db){
        if(!err){
            db.collection("mycoll",{safe:true},function(err,collection){
                if(!err){
                    suc&&suc(collection,db);
                }else{
                    error(err);
                }
            });
        }else{
            error(err);
        }
    });
}
dbop.insert=function(arr,suc,error){
   dbop.open(function(collection,db){
       collection.insert(arr,{safe:true},function(err,result){
           if(!err){
               suc(result);
           }else{
               error(err);
           }
           db.close();
       });
   },function(err){error(err)});
};
dbop.update=function(obj,objset,suc,error){
    dbop.open(function(collection,db){
        collection.update(obj, {$set: objset}, {safe: true}, function (err, result) {
            if(!err){
                suc(result);
            }else{
                error(err);
            }
            db.close();
        });
    },function(err){error(err)});
};
dbop.find=function(suc,error){
    dbop.open(function(collection,db){
        collection.find().toArray(function(err,docs){
            if(!err){
                suc(docs);
            }else{
                error(err);
            }
            db.close();
        });
    });
};
dbop.findOne=function(suc,error){
    dbop.open(function(collection,db){
        collection.findOne(function(err,doc){
            if(!err){
                suc(doc);
            }else{
                error(err);
            }
            db.close();
        });
    },function(err){
        error(err);
    });
};
module.exports=dbop;
/*db.open(function(err,db){
    if(!err){
        console.log('connect');
        db.collection('mycoll',{safe:true},function(err,collection){
         var tmp1 = {title:'hello',number:1};
         collection.insert(tmp1,{safe:true},function(err,result){
         console.log(result);
         });
         });
         db.collection('mycoll',{safe:true},function(err,collection) {
         collection.update({title: 'hello'}, {$set: {number: 3}}, {safe: true}, function (err, result) {
         console.log(result);
         });
         });
         db.collection('mycoll',{safe:true},function(err,collection) {
         collection.remove({title: 'hello'}, {safe: true}, function (err, result) {
         console.log(result);
         });
         });
        db.collection('mycoll',{safe:true},function(err,collection){
            var tmp1 = {title:'hello'};
            var tmp2 = {title:'world'};
            collection.insert([tmp1,tmp2],{safe:true},function(err,result){
                console.log(result);
            });
            collection.find().toArray(function(err,docs){
                console.log('find');
                console.log(docs);
            });
            collection.findOne(function(err,doc){
                console.log('findOne');
                console.log(doc);
            });
        });
    }else{
        console.log(err);
    }
});*/
