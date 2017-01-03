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
        url: MasterConfig.C('baseUrl') + url,
        data: data,
        xhrFields: {
            withCredentials: 1
        },
        dataType: "json",
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
        success: function(res) {
            if (dealWithAjaxData(res) == 1) {
                if (params.success) {
                    params.success(res);
                }
            }else{
                if (params.fail) {
                    params.fail(res);
                } else {
                    msgAlert(res.msg);
                }
            }
        },
        error: function(res) {
            msgAlert("网络太差，请稍后重试",function(){
                if (params.error) {
                    params.error();
                }
            })
        },
        timeout: timeout
    });
}

function scrollToTop(){

    if ($("body").find('.scroll-to-top').length==0) {
        var str = '<div class="scroll-to-top"></div>'
        $("body").append(str);
    }
    var offset = 500,
        scroll_top_duration = 500,
        $back_to_top = $('.scroll-to-top');

    $(window).scroll(function(){
        ( $(window).scrollTop() > offset ) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible');
    });
    $back_to_top.on('click', function(event){
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0 ,
            }, scroll_top_duration
        );
    });
}

// function loadMore(){
//     if ($("body").find('.loadMore').length==0) {
//         var str = '<div class="weui-loadmore loadMore"><i class="weui-loading"></i><span class="weui-loadmore__tips">正在加载</span></div>';
//         $("body").append(str);
//     }else{
//         $('.loadMore').show();
//     }
// }

// function loadMoreHide(){
//     $(".loadMore").hide();
// }

function loadNoMore(msg){
    var message = msg ? msg : "已到最后一页"
    if ($("body").find('.loadNoMore').length==0) {
        var str = '<div class="weui-loadmore weui-loadmore_line loadNoMore"><span class="weui-loadmore__tips">'+message+'</span></div>';
        $("body").append(str);
    }else{
        $(".weui-loadmore__tips").text(message);
    }
    $('.loadNoMore').show();
}

function loadNoMoreHide(){
    $(".loadNoMore").hide();
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
    }, 1200)

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

function msgConfirm (msg, successCallback, failCallback) {
    msg = msg == undefined ? '是否确认操作?' : msg
    successCallback = successCallback == undefined ? "" : successCallback
    failCallback = failCallback == undefined ? "" : failCallback
    if ($("body").find('#confirmToast').length) {
        $(".weui-dialog__bd").text(msg);
    }else{
        var str = '<div id="confirmToast" style="display: none;">'+
            '<div class="weui-mask"></div>' +
            '<div class="weui-dialog" style="display: none;">' +
                // '<div class="weui-dialog__hd"><strong class="weui-dialog__title">弹窗标题</strong></div>' +
                '<div class="weui-dialog__bd">'+msg+'</div>' +
                '<div class="weui-dialog__ft">' +
                    '<a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default">取消</a>' +
                    '<a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary">确认</a>' +
                '</div>' +
            '</div>' +
        '</div>';
        $("body").append(str);
    }
    $('#confirmToast').show();
    setTimeout(function(){
        $('.weui-dialog').fadeIn();
    },100)

    $(".weui-dialog__btn_default").off('click').on('click', function(){
        msgConfirmHide();
        failCallback();
    })

    $(".weui-dialog__btn_primary").off('click').on('click', function(){
        msgConfirmHide();
        successCallback();
    })
    
}

function msgConfirmHide () {
    $(".weui-dialog").fadeOut(function(){
        setTimeout(function(){
            $('#confirmToast').hide();
        },100)
    });
}

//加法函数
function accAdd(arg1, arg2){
    return accSub(arg1,arg2*(-1));
}

//减法函数
function accSub(arg1, arg2) {
    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

//乘法函数
function accMul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
        m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

//除法函数
function accDiv(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
    }
    try {
        t2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
    }
    r1 = Number(arg1.toString().replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));
    return accMul((r1 / r2), Math.pow(10, t2 - t1));
}


//common_raw
function doAlert(e) {
    alert(e)
}

function dealWithAjaxData(data) {
    if (0 == data.code) return 1;
    switch ("" + data.code) {
        case "40001":
            reLogin();
                break;
        case "40029":
            common.wechatAuthorize()
    }
    return 0
}

function reLogin() {
    setCookie("AccessToken", "", 0), common.login(1)
}


function getCookie(e) {
    return document.cookie.length > 0 && (c_start = document.cookie.indexOf(e + "="), -1 != c_start) ? (c_start = c_start + e.length + 1, c_end = document.cookie.indexOf(";", c_start), -1 == c_end && (c_end = document.cookie.length), unescape(document.cookie.substring(c_start, c_end))) : ""
}

function setCookie(e, o, n) {
    var t = e + "=" + o + "; ",
        i = "";
    null !== n && void 0 !== n && (i = "expires=" + new Date(1e3 * n) + "; "), document.cookie = t + i + "path=/;domain="+MasterConfig.C("domainUrl")
}


function isWeChatBrowser() {
    var e = navigator.userAgent.toLowerCase();
    return "micromessenger" == e.match(/MicroMessenger/i) ? 1 : 0
}
var _hmt = _hmt || [];
var common = {
        getApi: function(url) {
            var port = parseInt(getCookie("BackendPort"));
            return (port ? ":" + port : "") + "/" + url + "&app_id=" + MasterConfig.C("appId") + "&payment_app_id=" + MasterConfig.C("appId") + "&provider=WECHAT"
        },
        login: function() {
            // doAlert('login');
            if (!MasterConfig.C('is_debug')) {
                var appId = MasterConfig.C("appId"),
                    code = this._GET().code;
                // doAlert("code: " + code);
                if (void 0 === code) {
                    var n = location.origin + common.removeParamFromUrl(["from", "code", "share_id", "isappinstalled", "state", "m", "c", "a"]),
                        t = MasterConfig.C("oauthUrl");
                    // doAlert(t + "appid=" + appId + "&redirect_uri=" + encodeURIComponent(n) + "#wechat_redirect");
                    location.href = t + "appid=" + appId + "&redirect_uri=" + encodeURIComponent(n) + "#wechat_redirect";
                } else{
                    // doAlert("start api login");
                    var _self = this;
                    http({
                        url: _self.getApi("wechat/login?__ph="),
                        type: "post",
                        data: {'code':code,'app_id':appId},
                        success: function(data){
                            setCookie("AccessToken", data.data.access_token, data.data.expires - 10);
                            setCookie("AppId", appId, null);
                            setCookie("OpenId", data.data.open_id, null);
                            setCookie("UserSN", data.data.user_sn, null);
                            location.href = common.removeParamFromUrl(["code"]);
                        }
                    })
                }
            }
        },
        checkLoginStatus: function(callback) {
            callback?callback:"";
            if (isWeChatBrowser() || "true" != MasterConfig.C("is_debug") && "app_jump" != common._GET().source) {
                var accessToken = getCookie("AccessToken"),
                    AppId = getCookie("AppId"),
                    appId = MasterConfig.C("appId");
                return "" != accessToken && AppId == appId ? callback() : common.login()
            }
        },
        _GET: function() {
            var e = location.search,
                o = {};
            if ("" == e || void 0 == e) return o;
            e = e.substr(1).split("&");
            for (var n in e) {
                var t = e[n].split("=");
                o[t[0]] = t[1]
            }
            return o.from && delete o.code, o
        },
        alert: function(e) {
            "" == getCookie("DevDebug") ? console.log(e) : alert(e)
        },
        removeParamFromUrl: function(e) {
            var o = common._GET();
            for (var n in e) delete o[e[n]];
            return location.pathname + common.buildUrlParamString(o)
        },
        buildUrlParamString: function(e) {
            var o = "";
            for (var n in e) o += n + "=" + e[n] + "&";
            o = o.slice(0, o.length - 1);
            var t = "" == o || void 0 == o;
            return t ? "" : "?" + o
        },
        wechatAuthorize: function() {
            var e = MasterConfig.C("appId"),
                o = location.origin + common.removeParamFromUrl(["from", "code", "share_id", "isappinstalled", "state", "m", "c", "a"]),
                n = MasterConfig.C("oauthUrl");
            location.href = n + "appid=" + e + "&redirect_uri=" + encodeURIComponent(o) + "#wechat_redirect"
        },

        aaa: function(){
            alert(1234);
        }
};

$(function(){
    FastClick.attach(document.body);
})