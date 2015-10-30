/**
 * Created with IntelliJ IDEA.
 * User: yaotaiyang
 * Date: 14-7-30
 * Time: 下午9:38
 * To change this template use File | Settings | File Templates.
 */
var express = require("express");
var router=require("./routes");
var bodyParser=require("body-parser");
var app = express();
var template = require('art-template');
template.config('base', '');
template.config('compress',true);
template.config('extname', '.html');
app.engine('.html', template.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/public', express.static(__dirname + '/public'));
app.use(router);
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
