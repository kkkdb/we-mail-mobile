import api from './api.js'
import {http, getJsonLength, deepClone, objChangeArr, msgAlert} from './common.js'

var io = true;
var vm = new Vue({
    el: "#app",
    mounted: function() {
        this.getGoodsInfo();
        $(".container").css('min-height', $(window).height());
        $(".layout-content").css('max-height', $(window).height()*.85);
    },
    data: {
        select_type: 1,
        goodsInfo: {},
        showSku: false,
        goods: {
            hasSelectSku: false,
            original_price_range: '', //虚假价格范围
            current_price_range: '', //真实价格范围
            selected_original_price: '', //选中的sku的虚假价格
            selected_current_price: '', //选中的sku的真实价格
            style_name_list: [], //选中之后的规格名
            buy_quantity: 1,
            item_quantity: 0,
            all_quantity: 0,
            hasMaxQuantity: false,
        },
        smallImg: '',
        skuList: [], //每次选择之后的sku列表
        searchTerms: {}, //搜索条件
        formData: {}, //提交数据
        styleNameMappingList: {}, //规格字符串中文映射
    },
    methods: {
        getGoodsInfo() {
            var _self = this;
            http({
                url: api.getGoodsDetail,
                success: function(data){
                    $.each(data.data.style_type_list,function(index, elem){
                        elem.select_id = '';
                        elem.style_list.forEach(function(item){
                            if (data.data.style_type_list.length==1) {
                                var temp_obj = {};
                                data.data.skus.forEach(function(item2){
                                    temp_obj[item2.style_id_list[elem.sku_style_key]] = item2.quantity;
                                })
                                if (temp_obj[item.id] == 0) {
                                    item.hasQuantity = false;
                                }else{
                                    item.hasQuantity = true;
                                }
                            }else{
                                item.hasQuantity = true;
                            }
                        })
                        _self.styleNameMappingList[elem.sku_style_key] = elem.name;
                        _self.formData[elem.sku_style_key] = '';
                    })
                    _self.goodsInfo = data.data;

                    var priceList = _self.goodsInfo.skus;

                    priceList.sort(function(a, b) {
                        return a.price - b.price
                    })

                    _self.goods.current_price_range = priceList[0].price == priceList[priceList.length - 1].price ? priceList[0].price : (priceList[0].price + ' - ' + priceList[priceList.length - 1].price);

                    _self.goods.original_price_range = priceList[0].price_dot == priceList[priceList.length - 1].price_dot ? priceList[0].price_dot : priceList[0].price_dot + ' - ' + priceList[priceList.length - 1].price_dot;

                    $("title").html(_self.goodsInfo.title);

                    _self.goods.all_quantity = 0;

                    _self.goodsInfo.skus.forEach(function(elem){
                        _self.goods.all_quantity += Number(elem.quantity);
                    })

                    _self.goods.item_quantity = _self.goods.all_quantity;

                    _self.$nextTick(function() {
                        var mySwiper = new Swiper('.swiper-container', {
                            // direction: 'vertical',
                            loop: true,

                            // 如果需要分页器
                            pagination: '.swiper-pagination',

                            slidesPerView: 'auto',
                            centeredSlides: true,
                            paginationClickable: true,
                            // spaceBetween: 30,

                            breakpoints: {
                                //当宽度小于等于320
                                320: {
                                    slidesPerView: 1,
                                    spaceBetweenSlides: 10
                                }
                            },

                            autoplay: 3000, //可选选项，自动滑动

                            autoplayDisableOnInteraction: false, //手动滑动后继续自动滑动
                        })
                    })

                }
            })
        },
        showSkuDetail(num) {
            this.select_type = num;
            this.smallImg = this.goodsInfo.picture[0].url;
            this.showSku = true;
        },
        hideSkuDetail() {
            this.showSku = false;
        },
        selectSku (elem, item){
            var _self = this;

            if (!elem.hasQuantity) {
                return false;
            }

            if (elem.url) {
                this.smallImg = elem.url;         
            }

            if (item.select_id == elem.id) {
                item.select_id = '';
                delete _self.searchTerms[item.sku_style_key];
                _self.formData[item.sku_style_key] = '';
            }else{
                item.select_id = elem.id;
                _self.searchTerms[item.sku_style_key] = elem.id;
                _self.formData[item.sku_style_key] = elem.id;
            }

            _self.skuList = getSelectItem( _self.searchTerms, _self.goodsInfo.skus);

            var length = _self.goodsInfo.style_type_list.length;

            if (length==1) { //一种规格项目

            }else if (length==2) { //两种规格项目
                if (getJsonLength(_self.searchTerms) == 1) {
                    checkThree(_self.searchTerms);
                }else if (getJsonLength(_self.searchTerms) == 0){
                    relaxStyleType(_self.goodsInfo.style_type_list);
                }else{
                    var temp_obj = {};
                    temp_obj[item.sku_style_key] = _self.searchTerms[item.sku_style_key];
                    checkThree(temp_obj);
                }
            }else{ //三种规格项目
                if (getJsonLength(_self.searchTerms) == 2) {
                    checkThree(_self.searchTerms);
                }else if (getJsonLength(_self.searchTerms) < 2){
                    relaxStyleType(_self.goodsInfo.style_type_list);
                }else{
                    var temp_obj = deepClone(_self.searchTerms);
                    delete temp_obj[item.sku_style_key];
                    var temp_arr = objChangeArr(temp_obj, true);
                    var obj1 = temp_arr[0];
                    obj1[item.sku_style_key] = elem.id;
                    var obj2 = temp_arr[1];
                    obj2[item.sku_style_key] = elem.id;
                    checkThree(obj1);
                    checkThree(obj2);
                }
            }

            if (getJsonLength(_self.skuList) == 1) {
                _self.goodsInfo.skus.forEach(function(elem5){
                    var i = 0;
                    $.each(elem5.style_id_list, function(key, value){
                        if (_self.skuList[0].style_id_list[key] == value) {
                            i++;
                        }
                    })
                    if (i==length) {
                        _self.goods.selected_original_price = elem5.price;
                        _self.goods.selected_current_price = elem5.price_dot;
                        _self.goods.item_quantity = elem5.quantity;

                        _self.goods.style_name_list = [];
                        $.each(elem5.style_id_list, function(key, value){
                            _self.goodsInfo.style_type_list.forEach(function(elem6){
                                elem6.style_list.forEach(function(elem7){
                                    if (elem7.id == value) {
                                        _self.goods.style_name_list.push(elem7.name);
                                    }
                                })
                            })
                        })
                    }
                })
                _self.goods.buy_quantity = 1;
            }else{
                _self.goods.selected_original_price = "";
                _self.goods.selected_current_price = "";
                _self.goods.item_quantity = _self.goods.all_quantity;
            }
        },
        minusBuyQuantity () {
            this.goods.hasMaxQuantity = false;
            this.goods.buy_quantity == 1 ? '' : this.goods.buy_quantity--
        },
        plusBuyQuantity () {
            var _self = this;
            lazy(function(){
                if (_self.goods.buy_quantity < _self.goods.item_quantity) {
                    if (_self.goods.buy_quantity + 1 == _self.goods.item_quantity) {
                        _self.goods.buy_quantity++;
                        _self.goods.hasMaxQuantity = true;
                    }else{
                        _self.goods.buy_quantity++;
                    }
                }else if(_self.goods.buy_quantity == _self.goods.item_quantity){
                    msgAlert('就这么几件啦～');
                }
            });
        },
        checkSelect () {
            var _self = this;
            var msg = '请选择 ';
            for(var item in _self.formData){
                if (_self.formData[item] == '') {
                    msg += _self.styleNameMappingList[item] + ' '
                }
            }
            if (msg!='请选择 ') {
                msgAlert(msg);
                return false;
            }

            return true;
        },
        addBuyCar() {
            if (this.checkSelect()) {
                msgAlert('已成功添加到购物车');
                this.hideSkuDetail();
            }
        },
        buyItNow () {
            if (this.checkSelect()) {

            }
        }
    }
})

//开关
function lazy(callback) {
    if (io) {
        io = false;
        clearInterval(timer); 
        var timer = setTimeout(function(){
            callback();
            io = true;
        },200)
    }
}

function checkThree (searchTerms) {
    var skuList = getSelectItem( searchTerms, vm.goodsInfo.skus);
    var leftStyleType = getLeftStyleType(vm.goodsInfo.style_type_list, searchTerms);
    relaxStyleType(leftStyleType);
    checkQuantity(leftStyleType, skuList);
}

function relaxStyleType (styleTypeList) {
    styleTypeList.forEach(function(elem){
        elem.style_list.forEach(function(elem2){
            elem2.hasQuantity = true;
        })
    })
}

function getLeftStyleType (styleTypeList, params) {
    var new_arr = [];
    styleTypeList.forEach(function(elem){
        if (params[elem.sku_style_key] == undefined) {
            new_arr.push(elem);
        }
    })
    return new_arr
}

function checkQuantity (styleTypeList, skuList) {
    styleTypeList.forEach(function(elem){
        elem.style_list.forEach(function(elem2){
            skuList.forEach(function(elem3){
                if (elem3.style_id_list[elem.sku_style_key] == elem2.id && elem3.quantity == 0) {
                    elem2.hasQuantity = false;
                }
            })                
        })
    })
}

function getSelectItem(params, arr) {
    var new_arr = [] , loop_arr = arr;
    $.each(params, function(key, value){
        new_arr = [];
        loop_arr.forEach(function(item){
            if (item['style_id_list'][key] == value) {
                new_arr.push(item)
            }                                
        })
        loop_arr = new_arr;
    })
    return loop_arr
}