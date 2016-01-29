/**
 * Created by yaoxy on 2016/1/30.
 */
define(function(){
    var app = angular.module('ngDirective', ['ng']);
    app.directive('paste',function(){
        return {
            restrict:"EA",
            link:function(scope,element){
                element.on("paste",function(e){
                    var clipboardData = e.clipboardData,i = 0, item,fd = new FormData();
                    if(clipboardData && clipboardData instanceof DataTransfer){
                        for(i=0 ; i < clipboardData.items.length; i++ ){
                            if( clipboardData.items[i]["kind"] === 'file'&&clipboardData.items[i]["type"].match(/^image\//i)){
                                item = clipboardData.items[i];
                                break;
                            }
                        };
                        var blob = item&&item.getAsFile();
                        if(!blob||!blob.type) return;//正常粘贴行为，返回
                        if(blob.type.match(/^image\//i)&&blob.size>0){
                            fd.append('file', blob);
                            startupload(fd,"/upload",loadprogress,loadsuccess,loaderror);
                        }else if(blob.type.match(/^image\//i)&&!blob.size){
                            alert("不能粘贴,请用截屏软件截屏后粘贴！");
                        };
                    }
                });
                scope.loadStatus = "上传…";
                scope.onFileSelect=function(file){
                    var fd = new FormData();
                    fd.append('file', file[0]);
                    startupload(fd,"/upload",loadprogress,loadsuccess,loaderror);
                };
                function startupload(formData,url,progress,success,error){
                    if(scope.loading == "loading") return;
                    scope.loading = "loading";
                    scope.$apply();
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
                    var btn_wrap = element.find(".uploadbtn");
                    var input_html = '<input tabindex="-1" class="fileupload" type="file" name="mypic">';
                    btn_wrap.append(input_html);
                    alert("上传失败！");
                }
                function loadsuccess(data){
                    scope.card.images.push({url:data.result.url,name:data.result.name,id:data.result.id});
                    if(data.status==1){
                        scope.loading = "";
                        scope.loadStatus = "上传…";
                    }
                    scope.$apply();
                }
                function loadprogress(e){
                    scope.loadStatus = Math.ceil(e.loaded/ e.total * 100) + "%";
                    scope.$apply();
                }
            }
        }
    });
    app.directive('draggable', function($document,$rootScope) {
        return {
            restrict:"EA",
            scope:{
                item:'=item',
                itemtype:'=itemtype'
            },
            link:function(scope, element, attrs) {
                var startX=0, startY=0, x = 0, y = 0,minY,maxY,wrap;
                element.css({
                    position: 'relative',
                    cursor:"default"
                });
                element.bind('mousedown', function(event) {
                    var parentOffset = element.parent()[0].getBoundingClientRect(),domOffset = element[0].getBoundingClientRect();
                    minY = parentOffset.top - domOffset.top;
                    maxY = parentOffset.bottom - domOffset.bottom;
                    startX = event.screenX - x;
                    startY = event.screenY - y;
                    wrap = document.querySelectorAll("[dropable]");
                    $document.bind('mousemove', mousemove);
                    $document.bind('mouseup', mouseup);
                });
                function mousemove(event) {
                    y = event.screenY - startY;
                    x = event.screenX - startX;
                    if(y<minY) y = minY;
                    if(y>maxY) y=maxY;
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
                            //element.addClass("moving");
                            scope.$emit("drop",{cur_wrap:cur_wrap,item:scope.item,itemtype:scope.itemtype});
                            break;
                        }
                    }
                    element.css({top:0,left:0});
                    startX=0;startY=0; x = 0;y = 0;
                }
            }
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
    });
    app.directive('dropable',function(){
        return {
            restrict:"EA",
            scope:{
                dataItem:'=dataitem'
            },
            link:function(scope, element,attrs){
                scope.$on("dropcard",function(e,data){
                    if(data.cur_wrap == element[0] && scope.dataItem != data.itemtype){
                        for(var i=0;i<data.itemtype.list.length;i++){
                            if(data.item == data.itemtype.list[i]){
                                data.itemtype.list.splice(i,1);
                            }
                        }
                        data.item.type=scope.dataItem.type;
                        scope.dataItem.list.push(data.item);
                        scope.$emit("moveCard",{originList:data.itemtype.list,curList:scope.dataItem.list,item:data.item});
                    }
                });
            }

        }
    });
    app.directive('rightclick', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.rightclick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    });
});