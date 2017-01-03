var menu = {
    template: '<div class="menu-list"><ul>'+
        '<li><a href="./goodsList.html"><img :src="homeImgUrl" alt="商城"/><p class="txt" :class="{warning: isHome}">商城</p></a></li>'+
        '<li><a href="./cart.html"><img :src="buyCarImgUrl" alt="购物车"/><p class="txt" :class="{warning: isBuycar}">购物车</p></a></li>'+
        '<li><a href="./orderList.html"><img :src="orderImgUrl" alt="订单列表"/><p class="txt" :class="{warning: isOrder}">订单列表</p></a></li>'+
        '<li><a href="./user.html"><img :src="userImgUrl" alt="个人中心"/><p class="txt" :class="{warning: isUser}">个人中心</p></a></li></ul></div>',
    props: ['isHome','isBuycar','isOrder','isUser'],
    computed: {
        homeImgUrl: function(){
            return this.isHome?"./img/menu-home2.png":"./img/menu-home.png"
        },
        buyCarImgUrl: function(){
            return this.isBuycar?"./img/menu-buycar2.png":"./img/menu-buycar.png"
        },
        orderImgUrl: function(){
            return this.isOrder?"./img/menu-order2.png":"./img/menu-order.png"
        },
        userImgUrl: function(){
            return this.isUser?"./img/menu-user2.png":"./img/menu-user.png"
        },
    }
}