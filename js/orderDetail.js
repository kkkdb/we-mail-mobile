var vm = new Vue({
	el: '#app',
	mounted: function(){
		this.order_id = common._GET().order_id;
		var _self = this;
		common.checkLoginStatus(function(){
			_self.getOrderInfo();
		})
	},
	data: {
		order: {},
		total_price: 0,
		total_num: 0,
		order_id: ""
	},
	methods: {
		getOrderInfo: function(){
			var _self = this;
			http({
				url: '/shop/trade/get',
				data: {
					order_id: this.order_id
				},
				success: function(data){
					data.data.sku_list.forEach(function(item){
						_self.total_price += Number(accMul(item.price, item.goods_number));
						_self.total_num ++;
					})
					data.data.status = pay_status[data.data.pay_status]?pay_status[data.data.pay_status]:order_status[data.data.order_status]					
					_self.order = data.data;
				}
			})
		}
	}
})