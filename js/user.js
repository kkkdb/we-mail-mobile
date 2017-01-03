var vm = new Vue({
	el: '#app',
	mounted: function(data){
		var _self = this;
		common.checkLoginStatus(function(){
			_self.getUserInfo();
		})
	},
	data: {
		user: {}
	},
	components:{
		'menu-component': menu
	},
	methods: {
		getUserInfo: function(){
			var _self = this;
			http({
				url: '/shop/user/get',
				success: function(data){
					_self.user = data.data;
				}
			})
		}
	}
})