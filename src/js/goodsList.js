import api from './api.js'
import {http} from './common.js'

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
    },
    methods: {
        getGoodsList() {
            var _self = this;
            http({
                url: api.getGoodsList,
                success: function(data) {
                	if (data.data.goods_list.length!=0) {
                    	for (var i = 0; i < data.data.goods_list.length; i++) {
                    		_self.goods_list.push(data.data.goods_list[i]);
                    	}                    		
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