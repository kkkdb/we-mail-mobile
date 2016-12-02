function deepClone(obj){
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var temp = obj.constructor();
    for (var key in obj) {
        temp[key] = deepClone(obj[key]);
    }
    return temp;
}

//获取json元素数量
function getJsonLength(obj){
    var size = 0, key;
    for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function objChangeArr (obj, needKey) {
    var arr = [];
    for(var key in obj){
        if (needKey) {
            var temp_obj = {};
            temp_obj[key] = obj[key];
            arr.push(temp_obj)
        }else{
            arr.push(obj[key])
        }
    }
    return arr
}