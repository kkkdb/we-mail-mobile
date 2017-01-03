var vm = new Vue({
	el: "#app",
	mounted: function(){
		var _self = this;

		$(".container").css('min-height', $(window).height() + 100)

        common.checkLoginStatus(function(){
            _self.getGoodsList();
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
                            _self.getGoodsList();
                        }
                    }
                }
            })
        })
	},
	// components:{
	// 	'menu-component': menu
	// },
	data: {
		shop_list: [{
			shop_id: MasterConfig.C("shop_id") || 1,
			shop_name: MasterConfig.C("shop_name"),
			status: "edit", //编辑还是删除状态 自己加
			goods_sku_list: [], //sku列表
			shop_check_all: false
		}],
		check_all: false, //全选
		all_price: 0, //总价格
		all_quantity: 0, //总件数

		page_size: 10,
		page_no: 0,
		is_end: false,
		io: true
	},
	methods: {
		getGoodsList: function() {
			var _self = this;
			http({
				url: '/trade/cart/get',
				data: {
					shop_id: MasterConfig.C("shop_id") || 1,
					page_size: _self.page_size,
					page_no: _self.page_no
				},
				success: function(data){
					if (data.data.length!=0) {
						data.data.forEach(function(item){
							item.checked = false;
							item.hasMaxQuantity = false;
						})
						_self.shop_list[0].goods_sku_list = _self.shop_list[0].goods_sku_list.concat(data.data);
						_self.$nextTick(function(){
							$("img.js-lazy").lazyload();
						})
						_self.io = true;
                	}else{
                		_self.is_end = true;
                		_self.shop_list[0].goods_sku_list.length?loadNoMore():loadNoMore("暂无数据")
                		$(".weui-loadmore").css('margin-bottom', '49px');
                	}


				}
			})
		},
		checkAll: function() {
			this.check_all = !this.check_all;
			var price = 0, quantity = 0;
			if (this.check_all) {
				this.shop_list.forEach(function(item){
					item.shop_check_all = true;
					item.goods_sku_list.forEach(function(elem){
						if (!elem.checked) {
							elem.checked = true;
							quantity++;
							price += Number(accMul(elem.price, elem.num));
						}
					})
				})
				this.subscPrice('add', price, quantity);
			}else{
				this.shop_list.forEach(function(item){
					item.shop_check_all = false;
					item.goods_sku_list.forEach(function(elem){
						if (elem.checked) {
							elem.checked = false;
							quantity++;
							price += Number(accMul(elem.price, elem.num));
						}
					})
				})
				this.subscPrice('desc', price, quantity);
			}
		},
		checkShopAll: function(elem) {
			elem.shop_check_all = !elem.shop_check_all;
			var price = 0, quantity = 0;
			if (!elem.shop_check_all) {
				this.check_all = false;
				elem.goods_sku_list.forEach(function(item){
					if (item.checked) {
						item.checked = false;
						quantity++;
						price += Number(accMul(item.price, item.num));
					}
				})
				this.subscPrice('desc', price, quantity);
			}else{
				elem.goods_sku_list.forEach(function(item){
					if (!item.checked) {
						item.checked = true;
						quantity++;
						price += Number(accMul(item.price, item.num));
					}
				})

				var num2 = 0;
				this.shop_list.forEach(function(elem3){
					if (elem3.shop_check_all) {
						num2++;
					}
				})
				if (num2 == this.shop_list.length) {
					this.check_all = true;
				}

				this.subscPrice('add', price, quantity);
			}
		},
		checkItem: function(item, elem) {
			item.checked = !item.checked;
			if (!item.checked) {
				this.check_all = false;
				elem.shop_check_all = false;
				this.subscPrice('desc', Number(accMul(item.price, item.num)), 1);
			}else{
				var num = 0;
				elem.goods_sku_list.forEach(function(elem2){
					if (elem2.checked) {
						num++;
					}
				})
				if (num == elem.goods_sku_list.length) {
					elem.shop_check_all = true;
				}
				var num2 = 0;
				this.shop_list.forEach(function(elem3){
					if (elem3.shop_check_all) {
						num2++;
					}
				})
				if (num2 == this.shop_list.length) {
					this.check_all = true;
				}

				this.subscPrice('add', Number(accMul(item.price, item.num)), 1);
			}
		},
		subscPrice: function(type, price, quantity) {
			if (type == 'add') {
				this.all_price = accAdd(this.all_price*1, Number(price));
				this.all_quantity = accAdd(this.all_quantity*1, Number(quantity));
			}else if(type == 'desc'){
				this.all_price = accSub(this.all_price*1, Number(price));
				this.all_quantity = accSub(this.all_quantity*1, Number(quantity));
			}
		},
		minusBuyQuantity: function(item) {
			var _self = this;
            item.hasMaxQuantity = false;
            if (item.num > 1) {
            	item.num--
            	http({
            		url: '/trade/cart/update',
            		data: {
            			sku_id: item.sku_id,
            			num: item.num,
            			shop_id: MasterConfig.C("shop_id") || 1
            		},
            		type: 'post',
            		success: function(data){
        				item.checked?_self.subscPrice('desc', Number(item.price), 0):"";
            		}
            	})
            }
        },
        plusBuyQuantity: function(item) {
        	var _self = this;
            if (Number(item.num) < Number(item.quantity)) {
                if (item.num + 1 == item.quantity) {
                    item.num++;
                    item.hasMaxQuantity = true;
                }else{
                    item.num++;
                }
                http({
            		url: '/trade/cart/update',
            		data: {
            			sku_id: item.sku_id,
            			num: item.num,
            			shop_id: MasterConfig.C("shop_id") || 1
            		},
            		type: 'post',
            		success: function(data){
                		item.checked?_self.subscPrice('add', Number(item.price), 0):"";
            		}
            	})
            }else if(item.num == item.quantity){
                msgAlert('就这么几件啦～');
            }
        },
        deleteItem: function(elem, item, index) {
        	var _self = this;
        	msgConfirm('确认要删除该商品吗?',function(){
        		http({
        			url: '/trade/cart/delete',
        			data: {
        				sku_id: item.sku_id,
        				shop_id: elem.shop_id
        			},
        			type: 'post',
        			success: function(data){
		        		elem.goods_sku_list.splice(index, 1);
		        		if (item.checked) {
		        			_self.subscPrice('desc', Number(accMul(item.price, item.num)), 1);
		        		}
		        		_self.$nextTick(function(){
		        			$("img.js-lazy").lazyload();
		        		})        				
        			}
        		})
        	},function(){
        		// alert(222);
        	})
        },
        orderStart: function(){
        	if (this.all_quantity==0) {
        		return false;
        	}
        	var skuList = [];
        	this.shop_list[0].goods_sku_list.forEach(function(item){
        		skuList.push({
        			sku_id: item.sku_id,
                	num: item.num
        		})
        	})
            localStorage.setItem("skuList", JSON.stringify(skuList));
            localStorage.setItem("source", "cart");
            location.href = './trade.html';
        }
	}
})