var vm = new Vue({
	el: "#app",
	mounted: function(){
		var _self = this;
		this.address_id = common._GET().address_id;
		var title = "";
		if (this.address_id) {
			title = "地址编辑"
			this.getAddressInfo(function(){
				var area = new LArea();
				area.init({
					'trigger': '#areaSelect',
					'keys': {
						id: 'region_id',
						name: 'region_name'
					},
					'value': [_self.address_info.province_id, _self.address_info.city_id, _self.address_info.district_id]
				});
			});
		}else{
			title = "新增地址"
			var area = new LArea();
			area.init({
				'trigger': '#areaSelect',
				'keys': {
					id: 'region_id',
					name: 'region_name'
				}
			});
		}
		$("title").text(title);
	},
	data: {
		address_id: "",
		address_info: {
			receive_name: "",
			mobile: "",
			province_id: "",
			city_id: "",
			district_id: "",
			shipping_address: ""
		},
		area_id: "",
		is_default: false
	},
	methods: {
		getAddressInfo: function(callback){
			var _self = this;
			http({
				url: '/user/address/get',
				data: {
					address_id: this.address_id
				},
				success: function(data){
					data.data.address_str = data.data.province_name + " " + data.data.city_name + " " + data.data.district_name;
					_self.address_info = data.data;
					_self.is_default = _self.address_info.status=="DEFAULT"?true:false;
					_self.$nextTick(function(){
						callback();
					})
				}
			})
		},
		save: function(){
			var _self = this;
			var telPattern=/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
			//验证必要信息
			if ($.trim(_self.address_info.receive_name) == "") {
				msgAlert('请输入收货人姓名');
				return false;
			}
			if ($.trim(_self.address_info.mobile) == "") {
				msgAlert('请输入收货人电话号码');
				return false;
			}
			if(!telPattern.test(_self.address_info.mobile)) { 
                msgAlert('收货人电话格式无效');
				return false;
            }
            if (_self.address_info.province_id == "") {
            	msgAlert('请选择省');
				return false;
            }
            if (_self.address_info.city_id == "") {
            	msgAlert('请选择市');
				return false;
            }
            if (_self.address_info.district_id == "") {
            	msgAlert('请选择区');
				return false;
            }
            if (_self.address_info.shipping_address == "") {
            	msgAlert('请填写详细地址');
				return false;
            }
            if (this.address_id) {
            	http({
					url: '/user/address/update',
					data: {
						"address_id": _self.address_id,
						"receive_name": _self.address_info.receive_name,
					    "mobile": _self.address_info.mobile,
					    "province_id": _self.address_info.province_id,
					    "city_id": _self.address_info.city_id,
					    "district_id": _self.address_info.district_id,
					    "shipping_address": _self.address_info.shipping_address,
					    "status": _self.is_default?"DEFAULT":"COMMON"
					},
					type: 'post',
					success: function(data){
						msgAlert('地址修改成功',function(){
							location.href='./addressList.html'
						});
					}
				})
            }else{
				http({
					url: '/user/address/add',
					data: _self.address_info,
					type: 'post',
					success: function(data){
						msgAlert('地址添加成功',function(){
							location.href='./addressList.html'
						});
					}
				})
            }
		}
	},
	watch: {
		area_id: function(newVal){
			if (newVal) {
				var arr = newVal.split(',');
				this.address_info.province_id = arr[0];
				this.address_info.city_id = arr[1];
				this.address_info.district_id = arr[2];
			}
		}
	}
})