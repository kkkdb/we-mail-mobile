export default (params) => {
    if (!params.url) {
        console.warn("请传入请求地址");
        return;
    }

    const url = params.url,
        type = (params.type == undefined) ? "get" : params.type,
        data = (params.data == undefined) ? '' : params.data,
        hasLoading = (params.hasLoading == undefined || params.hasLoading == true || params.hasLoading == 'true') ? true : false,
        timeout = params.timeout || 20000;

    if (hasLoading) {
        var loading = layer.load(1);
    }

    $.ajax({
        type: type,
        url: url,
        data: data,
        success(res) {
            if (hasLoading) {
                layer.close(loading);
            }

            if (res.success) {
                if (params.success) {
                    params.success(res);
                }
            } else {
                if (params.fail) {
                    params.fail(res);
                } else {
                    layer.msg(res.errorMsg, {
                        time: 2000
                    });
                }
            }
        },
        error(res) {
            if (hasLoading) {
                layer.close(loading);
            }

            layer.msg("网络太差，请稍后重试", {
                time: 1800
            }, () => {
                if (params.error) {
                    params.error();
                }
            });
        },
        timeout: timeout
    });
}
