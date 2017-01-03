var vm = new Vue({
	el: "#app",
	mounted: function() {
		$(".container").css('min-height', $(window).height() + 50)
		this.sku_list = JSON.parse(localStorage.getItem("skuList"));
		this.source = localStorage.getItem("source");
		var _self = this;
		common.checkLoginStatus(function(){
			_self.getOrderInfo();			
		})
	},
	data: {
		trade: {},

		address_list: [],
		add_address: false,
		select_address: false,
		select_pay_type: false,
		selectedAddressId: "", //选中的地址ID

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
		sku_list: "",
		source: ""
	},
	methods: {
		getOrderInfo: function(){
			var _self = this;
			_self.total_price = 0;
			http({
				url: '/trade/prepay/preorder',
				data: {
					source: _self.source,
					shop_id: MasterConfig.C("shop_id"),
					sku_list: _self.sku_list
				},
				type: "post",
				success: function(data){
					data.data.sku_list.forEach(function(item){
						_self.total_price += Number(accMul(item.price, item.num))
						item.price = Number(item.price).toFixed(2);
					})
					_self.trade = data.data;
					_self.total_price = _self.total_price.toFixed(2);
					_self.total_price_1 = _self.total_price.split(".")[0] + '.';
					_self.total_price_2 = _self.total_price.split(".")[1];
				}
			})
		},
		getAddressList: function(callback) {
			var _self = this;
			http({
				url: "/user/addresses/get",
				success: function(data){
					_self.address_list = data.data;
					callback?callback(data):"";
				}
			})
		},
		changeSelectedAddress: function(item) {
			var _self = this;
			http({
				url: '/user/address/default',
				data: {
					address_id: item.address_id
				},
				type: "post",
				success: function(data){
					_self.hideAddressModel(1);
					_self.trade.address = item;
				}
			})
		},
		showAddress: function(type) {
			var _self = this;
			if (!this.selectedAddressId) {
				for(var item in this.formData){
					this.formData[item] = '';
				}
				this.formData.status = 'COMMON';
				this.area_name = '';
			}
			if (type == 0) {
				if (this.selectedAddressId){
					var area = new LArea();
					area.init({
						'trigger': '#areaSelect',
						'keys': {
							id: 'region_id',
							name: 'region_name'
						},
						'value': [_self.formData.province_id, _self.formData.city_id, _self.formData.district_id]
					});
				}else{
					var area = new LArea();
					area.init({
						'trigger': '#areaSelect',
						'keys': {
							id: 'region_id',
							name: 'region_name'
						},
						'value': [0, 0, 0]
					});
				}
				this.add_address = true;
				var obj = $(".add_address_box");
				$(".select_address_box").css("z-index",997)
				$(".select_address_mask").css("z-index",996)
				$(".add_address_mask").css("z-index",998)
				obj.css("z-index",999)
			}else{
				this.getAddressList();
				this.select_address = true;
				var obj = $(".select_address_box")
			}
			setTimeout(function(){
				$("html").css({"overflow":"hidden","height":$(window).height()});
				$("body").css({"overflow":"hidden","height":$(window).height()});
				obj.css({
					"transform": "translate3d(0px,0px,0px)",
					"opacity": 1
				});
			},200)
		},
		cancelAddress: function(type) {
			var _self = this;
			if (type==0) {
				msgConfirm('确认放弃此次编辑吗?',function(){
					_self.selectedAddressId = "";
					_self.hideAddressModel(type);
				},function(){
					$("#confirmToast").remove();
				})				
			}else{
				_self.hideAddressModel(type);
			}
		},
		hideAddressModel: function(type){
			var _self = this;
			var obj = type==0?$(".add_address_box"):$(".select_address_box");
			obj.css({'transform': "translate3d(0px,200px,0px)", "opacity": 0});
			setTimeout(function(){
				$("#confirmToast").remove();
				type == 0 ? _self.add_address = false:_self.select_address = false;
				$("html").css({"overflow":"","height":""});
				$("body").css({"overflow":"","height":""});
			},200)
		},
		addNewAddress: function(){
			var _self = this;
			var telPattern=/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
			//验证必要信息
			if ($.trim(_self.formData.receive_name) == "") {
				msgAlert('请输入收货人姓名');
				return false;
			}
			if ($.trim(_self.formData.mobile) == "") {
				msgAlert('请输入收货人电话号码');
				return false;
			}
			if(!telPattern.test(_self.formData.mobile)) { 
                msgAlert('收货人电话格式无效');
				return false;
            }
            if (_self.formData.province_id == "") {
            	msgAlert('请选择省');
				return false;
            }
            if (_self.formData.city_id == "") {
            	msgAlert('请选择市');
				return false;
            }
            if (_self.formData.district_id == "") {
            	msgAlert('请选择区');
				return false;
            }
            if (_self.formData.shipping_address == "") {
            	msgAlert('请填写详细地址');
				return false;
            }
            if (this.selectedAddressId) {
            	var formData2 = deepClone(_self.formData);
            	formData2.address_id = _self.selectedAddressId;
            	http({
					url: '/user/address/update',
					data: formData2,
					type: 'post',
					success: function(data){
						msgAlert('地址修改成功',function(){
							_self.getAddressList(function(data2){
								_self.trade.address = data2.data[0];
								_self.hideAddressModel(0);
							});
						});
					}
				})
            }else{
				http({
					url: '/user/address/add',
					data: _self.formData,
					type: 'post',
					success: function(data){
						msgAlert('地址添加成功',function(){
							_self.getAddressList(function(data2){
								_self.trade.address = data2.data[0];
								_self.hideAddressModel(0);
							});
						});
					}
				})
            }
		},
		editAddressItem: function(item, event){
			var _self = this;
			for(var elem in _self.formData){
				_self.formData[elem] = item[elem];
			}
			_self.area_name = item.province_name +" "+ item.city_name +" "+ item.district_name;
			_self.selectedAddressId = item.address_id;
			_self.showAddress(0);
			event.preventDefault();
			event.stopPropagation();
		},
		deleteAddress: function(){
			var _self = this;
			msgConfirm('确定要删除这个收货地址吗?',function(){
				http({
					url: '/user/address/delete',
					data:{
						address_id: _self.selectedAddressId
					},
					type: 'post',
					success: function(data){
						_self.hideAddressModel(0);
						_self.selectedAddressId = "";
						_self.getAddressList();
					}
				})
			},function(){
				$("#confirmToast").remove();
			})
		},
		choosePayType: function() {
			this.select_pay_type = true;
			setTimeout(function(){
				$("html").css({"overflow":"hidden","height":$(window).height()});
				$("body").css({"overflow":"hidden","height":$(window).height()});
				$(".pay_type_box").css({
					"transform": "translate3d(0px,0px,0px)",
					"opacity": 1
				});
			},200)
		},
		choosePayTypeItem: function(type){
			this.pay_type = type;
			this.hidePayChoose();
		},
		hidePayChoose: function(){
			var _self = this;
			$(".pay_type_box").css({
				"transform": "translate3d(0px,200px,0px)",
				"opacity": 0
			});
			setTimeout(function(){
				$("html").css({"overflow":"","height":""});
				$("body").css({"overflow":"","height":""});
				_self.select_pay_type = false;
			},200)
		},
		tradeBill: function(){
			var _self = this;
			if (_self.trade.address==undefined || _self.trade.address.address_id==undefined) {
				msgAlert('请选择收货地址');
				return false;
			}
			msgLoad("正在生成支付");
			http({
				url: '/trade/prepay/order',
				type: 'post',
				data: {
					source: _self.source,
					shop_id: MasterConfig.C("shop_id"),
					sku_list: _self.sku_list,
					pay_type: _self.pay_type,
					address_id: _self.trade.address.address_id,
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
		},
		changeProvince: function(){
			this.formData.city_id = "";
			this.formData.district_id = "";
		},
		changeCity: function(){
			this.formData.district_id = "";
		}
	},
	watch:{
		area_id: function(newVal){
			if (newVal) {
				var arr = newVal.split(',');
				this.formData.province_id = arr[0];
				this.formData.city_id = arr[1];
				this.formData.district_id = arr[2];
			}
		}
	}
})