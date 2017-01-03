var vm = new Vue({
	el: '#app',
	mounted: function(){
		var _self = this;
		common.checkLoginStatus(function(){
			_self.getAddressList();			
		})
	},
	data: {
		address_list: []
	},
	methods: {
		getAddressList: function(){
			var _self = this;
			http({
				url: '/user/addresses/get',
				success: function(data){
					_self.address_list = data.data;
					_self.$nextTick(function(){
						if ($(".address_list").height() > $(window).height - 50) {
							$(".container").css('min-height', $(window).height() + 80)
						}
						_self.setDelete();
					})
				}
			})
		},
		setDeafult: function(address_id){
			var _self = this;
			msgConfirm('确认设为默认地址?',function(){
				http({
					url: '/user/address/default',
					data: {
						address_id: address_id
					},
					type: "post",
					success: function(data){
						_self.getAddressList();
					}
				})				
			},function(){})
		},
		setDelete: function(){
			// 获取所有行，对每一行设置监听
		    var lines = $(".address-list-item");
		    var len = lines.length; 
		    var lastXForMobile;

		    // 用于记录被按下的对象
		    var pressedObj;  // 当前左滑的对象
		    var lastLeftObj; // 上一个左滑的对象

		    // 用于记录按下的点
		    var start;

		    // 网页在移动端运行时的监听
		    for (var i = 0; i < len; ++i) {
		        lines[i].addEventListener('touchstart', function(e){
		            lastXForMobile = e.changedTouches[0].pageX;
		            pressedObj = this; // 记录被按下的对象 

		            // 记录开始按下时的点
		            var touches = event.touches[0];
		            start = { 
		                x: touches.pageX, // 横坐标
		                y: touches.pageY  // 纵坐标
		            };
		        });

		        lines[i].addEventListener('touchmove',function(e){
		            // 计算划动过程中x和y的变化量
		            var touches = event.touches[0];
		            delta = {
		                x: touches.pageX - start.x,
		                y: touches.pageY - start.y
		            };

		            // 横向位移大于纵向位移，阻止纵向滚动
		            if (Math.abs(delta.x) > Math.abs(delta.y)) {
		                event.preventDefault();
		            }
		        });

		        lines[i].addEventListener('touchend', function(e){
		            if (lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
		                $(lastLeftObj).removeClass('can-delete'); // 右滑
		                lastLeftObj = null; // 清空上一个左滑的对象
		            }
		            var diffX = e.changedTouches[0].pageX - lastXForMobile;
		            if (diffX < -100) {
		            	// var str = '<div class="weui-mask_transparent delete_mask"></div>';
		            	// $("body").append(str);
		                $(pressedObj).addClass('can-delete'); // 左滑
		                lastLeftObj && lastLeftObj != pressedObj && 
		                    $(lastLeftObj).removeClass('can-delete'); // 已经左滑状态的按钮右滑
		                lastLeftObj = pressedObj; // 记录上一个左滑的对象
		            } else if (diffX > 100) {
		              	if (pressedObj == lastLeftObj) {
		                	$(pressedObj).removeClass('can-delete'); // 右滑
		                	lastLeftObj = null; // 清空上一个左滑的对象
		              	}
		            }
		        });
		    }
		},
		deleteAddress: function(item){
			var _self = this;
			msgConfirm('确定要删除这个收货地址吗?',function(){
				$(".address-list-item").removeClass('can-delete');
				http({
					url: '/user/address/delete',
					data:{
						address_id: item.address_id
					},
					type: 'post',
					success: function(data){
						_self.getAddressList();
					}
				})
			},function(){
				$("#confirmToast").remove();
			})
		}
	}
})