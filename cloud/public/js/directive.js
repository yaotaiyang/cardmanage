/**
 * Created by yaoxy on 2015/11/8.
 */
define(function(require,exports,module){
    var app = angular.module('card', []);
    function init(){
        app.directive("imgupload",function($window){
            return {
                restrict:"EA",
                link:function(scope, element, attrs) {

                }
            };
        });
        app.directive('minheight',function($window){
            return function(scope,element,attr){
                element.css({"min-height":$window.innerHeight-75+"px"});
                $window.addEventListener("resize",function(){
                    element.css({"min-height":$window.innerHeight-75+"px"});
                });
            };
        });
        app.directive('paste',function(){
            return {
                restrict:"EA",
                link:function(scope,element){
                    element.on("paste",function(e){
                        console.log("paste");
                        var clipboardData = e.clipboardData,i = 0, item,fd = new FormData();
                        if(clipboardData && clipboardData instanceof DataTransfer){
                            for(i=0 ; i < clipboardData.items.length; i++ ){
                                if( clipboardData.items[i]["kind"] === 'file'&&clipboardData.items[i]["type"].match(/^image\//i)){
                                    item = clipboardData.items[i];
                                    break;
                                }
                            };
                            var blob = item&&item.getAsFile();
                            if(!blob||!blob.type) return;/*正常粘贴行为，返回*/
                            if(blob.type.match(/^image\//i)&&blob.size>0){
                                fd.append('file', blob);
                                startupload(fd,"/upload",loadprogress,loadsuccess,loaderror);
                            }else if(blob.type.match(/^image\//i)&&!blob.size){
                                alert("不能粘贴,请用截屏软件截屏后粘贴！");
                            };
                        }
                        function startupload(formData,url,progress,success,error){
                            var xhr = new XMLHttpRequest();
                            xhr.open("post", url, true);
                            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                            xhr.upload.addEventListener("progress",progress,false);
                            xhr.addEventListener("load",function(){
                                success(JSON.parse(xhr.responseText));
                            },false);
                            xhr.addEventListener("error",error,false);
                            xhr.send(formData);
                        }
                        function loaderror(){
                            var txt_wrap = $(".panel .uploadbtn .text"),btn_wrap = txt_wrap.closest(".uploadbtn"),input_html = '<input tabindex="-1" class="fileupload" type="file" name="mypic">';
                            btn_wrap.append(input_html);
                            alert("上传失败！");
                        }
                        function loadsuccess(data){
                            console.log(data);
                            var txt_wrap = $(".panel .uploadbtn .text"),img_wrap = txt_wrap.closest(".v").find(".imgs-wrap"),btn_wrap = txt_wrap.closest(".uploadbtn"),input_html = '<input tabindex="-1" class="fileupload" type="file" name="mypic">';
                            if(data.status==0){
                                txt_wrap.html("拖放<br/>ctrl+v");
                                var imgs = img_wrap.find("img");
                                if(imgs.size()>=5){
                                    imgs.eq(0).remove();
                                }
                                img_wrap.append($("<img src ='"+data.data.path+"'/>"));
                            }
                            if($(".form-wrap input.fileupload").size()<1){
                                btn_wrap.append(input_html);
                            }
                        }
                        function loadprogress(e){
                            console.log(e.loaded/ e.total);

                        }
                    });
                }
            }
        });
        app.directive('draggable', function($document,$rootScope) {
            var wraplist = $document.find("[dropable]");
            return {
                restrict:"EA",
                link:function(scope, element, attrs) {
                    var startX=0, startY=0, x = 0, y = 0;
                    var wrap = document.querySelectorAll("[dropable]");
                    element.css({
                        position: 'relative',
                        cursor:"default"
                    });
                    element.bind('mousedown', function(event) {
                        startX = event.screenX - x;
                        startY = event.screenY - y;
                        $document.bind('mousemove', mousemove);
                        $document.bind('mouseup', mouseup);
                    });
                    function mousemove(event) {
                        y = event.screenY - startY;
                        x = event.screenX - startX;
                        element.addClass("draging").css({
                            top: y + 'px',
                            left:  x + 'px'
                        });
                    }
                    function mouseup(event) {
                        element.removeClass("draging");
                        $document.unbind('mousemove', mousemove);
                        $document.unbind('mouseup', mouseup);
                        for(var i=0;i<wrap.length;i++){
                            var cur_wrap = wrap[i];
                            if(inSideDom(element[0],cur_wrap)){
                                element.addClass("moving");
                                scope.$emit("drop",{pindex:cur_wrap.getAttribute("data-index"),oriPindex:element[0].getAttribute("data-pindex"),index:element[0].getAttribute("data-index"),element:element});
                                break;
                            }
                        }
                        element.css({top:0,left:0});
                        startX=0;startY=0; x = 0;y = 0;
                    }
                }
            }
        });
    }
    function inSideDom(tag,dom){
        var curRectObj = dom.getBoundingClientRect(),rectObj = tag.getBoundingClientRect();
        var point = {
            y:rectObj.top + rectObj.height/2,
            x:rectObj.left + rectObj.width/2
        };
        if(point.x > curRectObj.left && point.x<curRectObj.left+curRectObj.width && point.y > curRectObj.top && point.y < curRectObj.top+curRectObj.height){
            return true;
        }else{
            return false;
        }
    }
    module.exprot = init();
});
