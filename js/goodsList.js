var vm = new Vue({
    el: '#app',
    data: {
        goods_list: [],
        page_size: 10,
        page_no: 0,
        is_end: false,
        io: true,
    },
    mounted: function() {
    	var _self = this;
        scrollToTop();
        common.checkLoginStatus(function(){
            _self.getGoodsList();
            $(window).scroll(function(){
                var bot = 100; //bot是底部距离的高度
                if ((bot + $(window).scrollTop()) >= ($(document).height() - $(window).height())) {
                    //当底部基本距离+滚动的高度〉=文档的高度-窗体的高度时；
                    //我们需要去异步加载数据了
                    if (!_self.is_end) {
                        if (_self.io) {
                            _self.io = false;
                            _self.page_no++;
                            _self.getGoodsList();
                        }
                    }
                }
            })
        });
    },
    components: {
        "menu-component": menu
    },
    methods: {
        getGoodsList: function() {
            var _self = this;
            http({
                url: '/shop/items/onsale/get',
                data: {
                    shop_id: 1,
                    page_size: _self.page_size,
                    page_no: _self.page_no,
                },
                success: function(data) {
                	if (data.data.length!=0) {
                        data.data.forEach(function(item){
                            item.price = Number(item.price).toFixed(2);
                        })
                        _self.goods_list = _self.goods_list.concat(data.data);
                        _self.io = true;
                	}else{
                		_self.is_end = true;
                	}
                },
                complete: function(data){
                	_self.io = true;
                	_self.$nextTick(function(){
                		$("img.js-goods-lazy").lazyload({
                			threshold: 200,
						  	effect : "fadeIn"
						});
                	})
                }
            })
        }
    }
})