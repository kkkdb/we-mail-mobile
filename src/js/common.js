//ajax请求
function http(params){
    if (!params.url) {
        console.warn("请传入请求地址");
        return;
    }

    var url = params.url,
        type = (params.type == undefined) ? "get" : params.type,
        data = (params.data == undefined) ? '' : params.data,
        hasLoading = (params.hasLoading == undefined) ? '' : params.hasLoading,
        loadingTxt = (params.loadingTxt == undefined) ? '' : params.loadingTxt,
        timeout = params.timeout || 20000;

    $.ajax({
        type: type,
        url: url,
        data: data,
        beforeSend: function() {
            if (hasLoading) {
                if (loadingTxt) {
                    var loading = msgLoad(loadingTxt);
                }else{
                    var loading = msgLoad('',1);
                }                
            }
            if (params.beforeSend) {
                params.beforeSend();
            }
        },
        complete: function() {
            if (hasLoading) {
                msgLoadHide();                
            }
            if (params.complete) {
                params.complete();
            }
        },
        success(res) {
            var res = JSON.parse(res);
            if (res.code==0) {
                if (params.success) {
                    params.success(res);
                }
            } else {
                if (params.fail) {
                    params.fail(res);
                } else {
                    msgAlert(res.errorMsg);
                }
            }
        },
        error(res) {
            msgAlert("网络太差，请稍后重试",function(){
                if (params.error) {
                    params.error();
                }
            })
        },
        timeout: timeout
    });
}

function deepClone(obj){
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var temp = obj.constructor();
    for (var key in obj) {
        temp[key] = deepClone(obj[key]);
    }
    return temp;
}

//获取json元素数量
function getJsonLength(obj){
    var size = 0, key;
    for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function objChangeArr (obj, needKey) {
    var arr = [];
    for(var key in obj){
        if (needKey) {
            var temp_obj = {};
            temp_obj[key] = obj[key];
            arr.push(temp_obj)
        }else{
            arr.push(obj[key])
        }
    }
    return arr
}

var alert_timer = '';

function msgAlert (msg, callback) {
    if ($("body").find('.motify').length) {
        $(".motify-inner").text(msg);
    }else{
        var str = '<div class="motify"><div class="weui-mask_transparent" id="msgMask"></div><div class="motify-inner">'+msg+'</div></div>';
        $("body").append(str);
    }
    $('.motify').show();

    clearTimeout(alert_timer);
    alert_timer = setTimeout(function(){
        $('.motify').hide();
        if (callback) {callback()}
    }, 2000)

}

function msgLoad (msg, type) {
    msg = msg == undefined ? '数据加载中' : msg
    if ($("body").find('#loadingToast').length) {
        $(".weui-toast__content").text(msg);
    }else{
        var str = '<div id="loadingToast" style="display: none;">'+
            '<div class="weui-mask_transparent"></div>' +
            '<div class="weui-toast">' +
                '<i class="weui-loading weui-icon_toast"></i>' +
                '<p class="weui-toast__content">'+msg+'</p>' +
            '</div>' +
        '</div>';
        $("body").append(str);
    }
    $('#loadingToast').show();

    if (type&&type==1) {
        $(".weui-toast").css('background','rgba(256,256,256,0)');
        $(".weui-toast__content").hide();
    }
    
}

function msgLoadHide () {
    $('#loadingToast').hide();
}