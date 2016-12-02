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