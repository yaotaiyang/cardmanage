/**
 * Created by yaoxy on 2015/11/7.
 */
var fs = require('fs');
function init(req,res,obj){
    var AV= obj.AV;
    var file = req.files["file"];
    if(file && file.type.match(/image/)){
        fs.readFile(file.path, function(err, data){
            if(err) return obj.render(req,res,{data:{err:{}}});
            var base64Data = data.toString('base64');
            var theFile = new AV.File("photo.png", {base64: base64Data});
            theFile.save().then(function(data){
                obj.render(req,res,{data:data});
            });
        });
    }
};
exports.init=init;