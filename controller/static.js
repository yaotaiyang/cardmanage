/**
 * Created by yaoxy on 2016/2/21.
 * 静态资源输出
 */
var fs = require('fs');
function init(req,res,obj){
    var realPath = req.path;
    fs.readFile(__dirname +"/../" + realPath,"utf-8", function(err, data) {
        console.log(err);
        if (err) {
            res.writeHead(500, {'Context-Type': 'text/plain'});
            res.end('specify file not exists! or server error!');
        }
        else {
            res.writeHead(200, {'Context-Type': 'text/html'});
            res.write(data);
            res.end();
        }
    });
};
exports.init=init;
