var vm = new Vue({
	el: "#app",
	mounted: function() {
		$(".container").css('min-height', $(window).height() + 50)
		var _self = this;
		_self.order_id = common._GET().order_id;
		common.checkLoginStatus(function(){
			_self.getOrderInfo();			
		})
	},
	data: {
		trade: {},

		order_id: "",
		address_list: [],

		formData: {
			receive_name: "",
			mobile: "",
			shipping_address: "",
			province_id: "",
			city_id: "",
			district_id: "",
			status: "COMMON"
		},

		area_name: "",
		area_id: "",

		total_price: 0, //总价格
		total_price_1: "",//整数位
		total_price_2: "",//小数位

		pay_type: "WEIXIN",
		sku_list: []
	},
	methods: {
		getOrderInfo: function(){
			var _self = this;
			_self.total_price = 0;
			http({
				url: '/shop/trade/get',
				data: {
					order_id: _self.order_id
				},
				success: function(data){
					data.data.sku_list.forEach(function(item){
						_self.total_price += Number(accMul(item.price, item.goods_number))
						item.price = Number(item.price).toFixed(2);
						_self.sku_list.push({
							sku_id: item.sku_id, //TODO
							num: item.goods_number
						})
					})
					_self.trade = data.data;
					_self.total_price = _self.total_price.toFixed(2);
					_self.total_price_1 = _self.total_price.split(".")[0] + '.';
					_self.total_price_2 = _self.total_price.split(".")[1];
				}
			})
		},
		tradeBill: function(){
			var _self = this;
			msgLoad("正在生成支付");
			http({
				url: '/trade/prepay/order',
				type: 'post',
				data: {
					source: _self.trade.source, //TODO
					shop_id: MasterConfig.C("shop_id"),
					sku_list: _self.sku_list,
					pay_type: _self.pay_type, //TODO
					address_id: _self.trade.address_id, //TODO
					pay_amount: _self.total_price,
				},
				success: function(data){
		       		msgLoadHide();
					_self.pay(data.data);
				}
			})
		},
		pay: function(data) {
			function onBridgeReady(){
			   	WeixinJSBridge.invoke(
		       		'getBrandWCPayRequest', {
		           		"appId": data.appId,     //公众号名称，由商户传入     
			           	"timeStamp": data.timeStamp,         //时间戳，自1970年以来的秒数     
			           	"nonceStr": data.nonceStr, //随机串     
			           	"package": data.package,     
			           	"signType": data.signType,         //微信签名方式:     
			           	"paySign": data.paySign //微信签名 
			       	},
			       	function(res){
	           			// 使用以上方式判断前端返回,微信团队郑重提示:res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
		           		if(res.err_msg == "get_brand_wcpay_request:ok" ) {
		           			msgAlert("支付成功",function(){
		           				location.href = './orderDetail.html?order_id='+data.order_id
		           			});
	           			}else if(res.err_msg == "get_brand_wcpay_request:cancel"){
	           				location.href = './orderDetail.html?order_id='+data.order_id
	           			}else if(res.err_msg == "get_brand_wcpay_request:fail"){
	           				alert('支付失败');
	           			}
		       		}
			   	); 
			}
			if (typeof WeixinJSBridge == "undefined"){
			   if( document.addEventListener ){
			       document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
			   }else if (document.attachEvent){
			       document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
			       document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
			   }
			}else{
			   onBridgeReady();
			}
		}
	}
})