var MasterConfig = function() {
	var e = {
			baseUrl: "http://testtianfuweishopapi.leqeewechat.com",
			baseMobileUrl: "http://testtianfuweishop.leqeewechat.com/",
			domainUrl:"leqeewechat.com",
			oauthUrl: "https://open.weixin.qq.com/connect/oauth2/authorize?response_type=code&scope=snsapi_base&state=123&",
			shopAppId: 3,
			appId: "wx4978ebc6dae349c1",
			shop_name: "祈福",
			shop_id: "1",
			is_debug: 1,
		},
		t = {};
	return t.C = function(t) {
		return e[t]
	}, t
}();