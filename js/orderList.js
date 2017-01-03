var vm = new Vue({
	el: "#app",
	mounted: function(){
		var _self = this;
		_self.order_status = common._GET().status;
		_self.order_status = _self.order_status?_self.order_status:"ALL";
		scrollToTop();
		common.checkLoginStatus(function(){
			_self.getOrderList();
			$(window).scroll(function(){
                var bot = 300; //bot是底部距离的高度
                if ((bot + $(window).scrollTop()) >= ($(document).height() - $(window).height())) {
                    //当底部基本距离+滚动的高度〉=文档的高度-窗体的高度时；
                    //我们需要去异步加载数据了
                    if (!_self.is_end) {
                        if (_self.io) {
                            _self.io = false;
                            _self.page_no++;
                            // loadMore();
                            _self.getOrderList();
                        }
                    }
                }
            })
		})
	},
	components:{
		'menu-component': menu
	},
	data: {
		statusList: {
			'ALL': '全部订单',
			'UN_PAYED': '待付款',
			'UN_SHIPPED': '待发货',
			'SHIPPED': '已发货',
			'CLOSED': '已完成',
		},
		order_status: "",
		order_list: [],

		page_size: 10,
		page_no: 0,
		is_end: false,
		io: true,
	},
	methods: {
		getOrderList: function(){
			var _self = this;
			http({
				url: "/shop/trades/get",
				data: {
					shop_id: MasterConfig.C('shop_id'),
					page_size: _self.page_size,
					page_no: _self.page_no,
					order_status: _self.order_status
				},
				success: function(data){
					// loadMoreHide();
					if (data.data.length!=0) {
						data.data.forEach(function(item){
							item.status = pay_status[item.pay_status]?pay_status[item.pay_status]:order_status[item.order_status]
							item.total_price = 0;
							item.total_num = 0;
							item.sku_list.forEach(function(elem){
								item.total_price += Number(accMul(elem.price, elem.goods_number));
								item.total_num ++;
							})
						})
						_self.order_list = _self.order_list.concat(data.data);
						_self.io = true;
                	}else{
                		_self.is_end = true;
                		_self.order_list.length?loadNoMore():loadNoMore("暂无数据")
                	}
				}
			})
		},
		changeStatus: function(status){
			this.order_status = status;
			this.order_list = [];
			this.page_size = 10;
			this.page_no = 0;
			this.is_end = false;
			this.io = true;
			this.getOrderList();
			loadNoMoreHide();
		}
	}
})