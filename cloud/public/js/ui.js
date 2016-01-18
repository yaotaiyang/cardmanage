$(function(){
    $("body").delegate(".close","click",function(){
        $(this).closest(".panel").remove();
        $("body").trigger("click");
    });
    $("body").delegate("#content .add","click",function(){
        var obj = {};
        obj.progress = $(this).closest(".wrap").data("name");
        $("body").append(template("panel",obj));
        adddropevent();
    });
    $("body").delegate("form.addcard","submit",updatecard);
    $("body").delegate("form.filter","submit",formfilter);
    $("body").delegate(".card","dblclick",changecard);
    $("body").delegate("form .delete","click",delcard);
    $("body").delegate("#dateselect","change",switchweek);
    $("body").delegate(".fileupload","change",imgupload);
    $("body").delegate(".imgs-wrap img","click",seeimg);
    $("body").delegate("form.filter #groupfilter","change",function(){
        $(this.form).submit();
    });
    $("body").delegate(".wrap","webkitTransitionEnd",function(){
        dispatch(window,"resize");
    });
    $("body").delegate(".wrap .switch","click",function(){
        $(this).closest(".wrap").toggleClass("fold");
        //dispatch(window,"resize");
    });
    $(window).on("paste",paste);
    //禁用浏览器拖放
    $(document).on({
        dragleave:function(e){    //拖离
            e.preventDefault();
        },
        drop:function(e){  //拖后放
            e.preventDefault();
        },
        dragenter:function(e){    //拖进
            e.preventDefault();
        },
        dragover:function(e){    //拖来拖去
            e.preventDefault();
        }
    });
    $(".completetime").manhuaDate();
    $(document).on("contextmenu",function(e){
        var tar = $(e.target);
        $(".rightmenu").remove();
        if(tar.hasClass("imgmenu")){
            e.preventDefault();
            createMenu(tar,e);
        }
    });
    $(document).on("click",function(e){
        $(".rightmenu").remove();
    });
    $(window).on("resize",function(){
        $("#content").css("min-height",$(window).height()-40);
    });
    $("#dateselect").trigger("change");//初始化init
    function init(){
        template.config("escape",false);//设置模板引擎不转意html
        template.helper('shortdate', function (str) { //生成短日期
            return str.replace(/\d{4}./g,"");
        });
        template.helper('parsedate', function (str) { //生成日期
            var cur_time = new Date(str);
            var res =cur_time.getFullYear()+"年"+(cur_time.getMonth()+1)+"月"+cur_time.getDate()+"日 "+cur_time.getHours()+":"+cur_time.getMinutes();
            return res;
        });
        template.helper('highlight', function (str) {//高亮当前
            if(pageData.filter&&pageData.filter.length){
                var reg = new RegExp("("+pageData.filter.join("|")+")");
                return str.replace(reg,"<em class='red'>"+'$1'+"</em>");
            }else if(pageData.user.highlight){
                var reg = new RegExp("("+pageData.user.highlight.join("|")+")");
                return str.replace(reg,"<em class='red'>"+'$1'+"</em>");
            }else{
                return str;
            }
        });
        template.helper('toChinese', function (str) {//中文用户名转换
           return pageData.userlist[str].highlight[0]||str;
        });
        $("#content").html(template("cardwrap",pageData.config)); //卡片状态类别
        var ajaxdata={
            "type" : "select",
            "week" : pageData.curWeek
        };
        $.ajax({
            type:"get",
            url:"./ajax.php",
            dataType:"json",
            data:ajaxdata,
            success:function(data){
                if(data.status==0){
                    $("#content").html(template("cardwrap",pageData.config)).addClass("hidecard");
                    $(".menulist li").removeClass("selected");
                    $(".menulist li[data-week='"+pageData.curWeek+"']").addClass("selected");
                    sus(data.data);
                    $(window).trigger("resize");
                }else{
                    alert("请求数据出错！");
                }
            }
        });
    }
    function createMenu(dom,e){
        var html  = $(template("rightbtn",{}));
        html.css({"left":e.clientX,"top":e.clientY});
        $("body").append(html);
        html.on("click",function(){
            dom.remove();
        });
    }
    function adddropevent(){
        $(".panel form.addcard")[0].addEventListener("drop",function(e){
            e.preventDefault(); //取消默认浏览器拖拽效果
            var fileList = e.dataTransfer.files; //获取文件对象
            var fd = new FormData();
            fd.append('mypic', fileList[0]);
            startupload(fd,"upload.php",loadprogress,loadsuccess,loaderror);
        });
    }
    function imgupload(){
        var me = $(this),input_html = '<input tabindex="-1" class="fileupload" type="file" name="mypic">';
        var cur_v = me.closest(".v"),txt_wrap = cur_v.find(".text"),img_wrap = cur_v.find(".imgs-wrap"),btn_wrap=cur_v.find(".uploadbtn");
        var input = me;
        var form  = $("<form id='myupload' action='upload.php' method='post' enctype='multipart/form-data'></form>");
        form.append(me);
        var formData = new FormData(form[0]);
        startupload(formData,"upload.php",loadprogress,loadsuccess,loaderror);
    }
    function loaderror(){
        var txt_wrap = $(".panel .uploadbtn .text"),btn_wrap = txt_wrap.closest(".uploadbtn"),input_html = '<input tabindex="-1" class="fileupload" type="file" name="mypic">';
        btn_wrap.append(input_html);
        alert("上传失败！");
    }
    function loadsuccess(data){
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
        var txt_wrap = $(".panel .uploadbtn .text");
        if(e.total>=0){
            var percentVal = Math.ceil(e.loaded/ e.total)*100-1 + '%';
            txt_wrap.text(percentVal);
        }else{
            txt_wrap.text("100%");
        }
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
    function seeimg(){
        var me = $(this);
        var openwindow=window.open("","","location=no,fullscreen=yes");
        openwindow.document.write("<style type='text/css'>*{padding:0;margin:0}</style>");
        openwindow.document.write("<img style='max-width:100%' src='"+me.attr("src")+"'/>");
        openwindow.document.title="查看图片";
    }
    function switchweek(){
        var week = $(this).val();
        pageData.curWeek=week;
        //修改查看bug链接参数
        var bugslink = $("#seebugs"),cur_url = bugslink.attr("href"),reg  = new RegExp("&week=.{10}-.{10}");
        cur_url = cur_url.match(reg)? cur_url.replace(reg,"&week="+week):cur_url+ "&week="+week;
        bugslink.attr("href",cur_url);
        init();
    }
    function delcard(){
        if(!window.confirm("确认要删除吗？")){
            return;
        }
        var obj = $("form.addcard").data("obj");
        var ajaxdata={
            "type" : "delete",
            "week" : pageData.curWeek,
            "data" : JSON.stringify(obj)
        };
        $.ajax({
            url:"./ajax.php",
            data:ajaxdata,
            type:"get",
            dataType:"json",
            success:function(data){
                if(data.status==0){
                    sus(data.data);
                    $(".panel").remove();
                }else{
                    alert("失败！");
                }
            }
        });
    }
    function changecard(e){
        var $card = $(this);
        var obj = $.extend({},$card.data("obj"));
        var arr = obj.owners.map(function(val,ind){return val.name});
        obj.owners = arr.toString();
        obj.showmodefy  = 1;
        obj.weeklist = pageData.datelist;
        obj.curWeek = pageData.curWeek;
        obj.grouplist = pageData.config.group;
        $("body").append(template("panel",obj));
        setpanelposition();
        adddropevent();
        $(".panel form").data("obj",$card.data("obj"));
        $(".addcard img[data-src]").each(function(ind,dom){
            var me = $(this);
            if(me.data("src")){
                me.attr("src", $.qrcodeImg(me.data("src")));
            }else {
                me.remove();
            }
        });
    }
    function updatecard(e){
        e.preventDefault();
        var $form = $(this),time= + new Date();
        var chklist = $form.find("input[type='text'][data-check],textarea[data-check]");
        for(var i=0;i<chklist.length;i++){
            if(!$(chklist[i]).val()){
                alert("*号字段必填！");
                return;
            }
        }
        var temp_obj={"name":pageData.user.name,"time":time};
        var type = "insert";
        if($form.data("obj")){
            var obj = $form.data("obj");
            type = "update";
        }else{
            var obj = {"title":"","description":"","progress":"","modefy":[],"lastmodefy":{},"create":{},"owners":[]};
            obj.create= $.extend({},temp_obj);
            obj.create.guid = guid();
        }
        obj.owners = $form.find(".owners").val().replace(/，/g,",").replace(/^,|,$/g,"").split(",").map(function(name,ind){
            return {"name":name,"time":time}
        });
        obj.progress = $form.find(".progress").val();
        obj.title = $form.find(".title").val();
        obj.description = $form.find(".descri").val();
        obj.url = $form.find(".url").val();
        obj.cardstatus = $form.find("input[name='cardstatus']:checked").val();
        obj.suggestion = $form.find(".suggestion").val();
        obj.completetime = $form.find(".completetime").val();
        obj.group = $form.find(".groupselect").val() || $("#groupfilter").val();
        obj.lastmodefy = temp_obj;
        obj.modefy.push(temp_obj);
        obj.images = [].map.call($(".v .imgs-wrap img"),function(dom,ind){return $(dom).attr("src")});
        var ajaxdata={
            "type" : type,
            "week" : pageData.curWeek,
            "data" : JSON.stringify(obj)
        };
        var cur_week = $form.find(".week").val();
        if(cur_week && cur_week!=pageData.curWeek){
            ajaxdata.type = "movecard";
            ajaxdata.movetoweek = cur_week;
        }
        $.ajax({
            type:"get",
            url:"./ajax.php",
            dataType:"json",
            data:ajaxdata,
            success:function(data){
                if(data.status==0){
                    sus(data.data);
                    $(".panel").remove();
                }else{
                    alert("添加失败！");
                }
            }
        });
    }
    function sus(data){
        pageData.tplData=data;
        var datalist = data.list;
        var $container = $(".cardlist");
        if($container.data("masonry")){
            $container.masonry("destroy");
        }
        $container.find("li").remove();
        var obj_temp={};
        pageData.config.status.forEach(function(val){
            obj_temp[val]=$("<div></div>");
        });
        for(var i=0;i<datalist.length;i++){
            var cur_data=datalist[i];
            if(filterData(cur_data)){
                var cur_html = $(template("card",cur_data));
                cur_html.data("obj",cur_data);
                if(obj_temp[cur_data.progress]){
                    obj_temp[cur_data.progress].append(cur_html);
                }
                //高亮修改的卡片
                if(data.curobj && JSON.stringify(data.curobj.create)==JSON.stringify(cur_data.create)){
                    cur_html.addClass("highlightcard");
                }
            }else{
                console.log("被过滤的卡片！");
            }
        }
        for(var k in obj_temp){
            if(obj_temp[k].children().size()<=2){
                $(".wrap[data-name='"+k+"']").addClass("fold");
            }else{
                $(".wrap[data-name='"+k+"']").removeClass("fold");
            }
            $(".wrap[data-name='"+k+"'] .cardlist").append(obj_temp[k].children());
        }
        $container.masonry({
            itemSelector: '.card',
            gutterWidth: 20,
            isAnimated: true
        });
        $("#content").removeClass("hidecard");
        $(".card").draggable({
            containment:"#content",
            start:function(){$(this).addClass("dragging")}
        });
        $(".wrap").droppable({
            drop: function(event,ui) {
                dochange($(event.target),$(ui.draggable[0]));
            }
        });
    }
    function dochange($wrap,$card){
        var oridata = $card.data("obj");
        var databak = $.extend(oridata,{});
        if(oridata.progress!=$wrap.data("name")){
            oridata.progress=$wrap.data("name");
            oridata.lastmodefy.name = pageData.user.name;
            oridata.lastmodefy.time = +new Date();
            oridata.modefy.push($.extend(oridata.lastmodefy,{}));
            var ajaxdata={
                "type" : "update",
                "week" : pageData.curWeek,
                "data" : JSON.stringify(oridata)
            }
            $.ajax({
                type:"post",
                url:"./ajax.php",
                dataType:"json",
                data:ajaxdata,
                success:function(resdata){
                    if(resdata.status==0){
                        sus(resdata.data);
                    }else{
                        alert("修改出错！");
                        location.reload();
                    }
                }
            });
        }else{
            sus(pageData.tplData);
        }
    }
    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });

    }
    function parseUrl(url) {
        var r = {
            protocol: /([^\/]+:)\/\/(.*)/i,
            host: /(^[^\:\/]+)((?:\/|:|$)?.*)/,
            port: /\:?([^\/]*)(\/?.*)/,
            pathname: /([^\?#]+)(\??[^#]*)(#?.*)/
        };
        var tmp, res = {};
        res["href"] = url;
        for (p in r) {
            tmp = r[p].exec(url);
            res[p] = tmp[1];
            url = tmp[2];
            if (url === "") {
                url = "/";
            }
            if (p === "pathname") {
                res["pathname"] = tmp[1];
                res["search"] = tmp[2];
                res["hash"] = tmp[3];
            }
        }
        return res;
    }
    function dispatch(el, type){
        try{
            var evt = document.createEvent('Event');
            evt.initEvent(type,true,true);
            el.dispatchEvent(evt);
        }catch(e){
            console.log(e);
        };
    }
    function filterData(data){
        var str_group = $("#groupfilter").val();
        if(str_group!="全部"&&str_group!=data.group){
            return null;
        }
        if(pageData.filter&&pageData.filter.length>0){
            var isdata = null;
            for(var i=0;i<pageData.filter.length;i++){
                var cur_str = pageData.filter[i];
                var new_data = $.extend({},data);
                //获取中文名称，好匹配
                new_data.create.cnname = pageData.userlist[new_data.create.name]["highlight"][0];
                new_data.lastmodefy.cnname = pageData.userlist[new_data.lastmodefy.name]["highlight"][0];
                var filter_str = JSON.stringify(new_data);
                if(filter_str.indexOf(cur_str)!=-1){
                    //模糊搜索
                    return data;
                }
            }
            return  isdata;
        }else{
            return data;
        }
    }
    function formfilter(e){
        e.preventDefault();
        var val = $(this).find(".namelist").val();
        pageData.filter = val&&val.replace(/，/g,",").replace(/^,|,$/g,"").split(/,|\s/);
        sus(pageData.tplData);
    }
    function paste(e){
        //图片粘贴
        if($(".form-wrap input.fileupload").size()<1) return;
        var clipboardData = e.originalEvent.clipboardData,i = 0, item,fd = new FormData();
        if(clipboardData && clipboardData instanceof DataTransfer){
            for(i=0 ; i < clipboardData.items.length; i++ ){
                if( clipboardData.items[i]["kind"] === 'file'&&clipboardData.items[i]["type"].match(/^image\//i)){
                    item = clipboardData.items[i];
                    break;
                }
            }
            var blob = item&&item.getAsFile();
            if(!blob||!blob.type) return;//正常粘贴行为，返回
            if(blob.type.match(/^image\//i)&&blob.size>0){
                fd.append('mypic', blob);
                startupload(fd,"upload.php",loadprogress,loadsuccess,loaderror);
            }else if(blob.type.match(/^image\//i)&&!blob.size){
                alert("不能粘贴,请用截屏软件截屏后粘贴！");
            }
        }
    }
    function setpanelposition(){
        var $dom = $(".panel .form-wrap");
        if($dom.height()<$(window).height()){
            $dom.css("position","fixed");
        }else{
            $dom.css("top",$(window).scrollTop());
        }
    }
});

