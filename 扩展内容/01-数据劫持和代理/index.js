//vue数据劫持代理
//模拟vue中data选项
let data={
	username:'curry',
	age:'33'
	
}
//模拟组件的实例
let _this={
	
}
//利用Object.defineProperty()
for(let item in data){
	// console.log(item);
	// console.log("------------------------------")
	// console.log(data[item]);
	Object.defineProperty(_this,item,{
		//get方法用来获取扩展属性值，当获取该属性值的时候调用get方法
		get(){
			console.log("get方法调用了！")
			return data[item]
		},
		//set方法用来监视扩展属性，只要修改扩展属性就能调用
		set(newvalue){
			console.log(newvalue);
			data[item]=newvalue;
			console.log(item);
		}
	})
}
console.log(_this);
// 通过Object.defineProperty的get方法添加扩展属性不能直接对象.属性修改
//所以下面没用
// _this.username='wade';
// console.log(_this.username);
//解决方案
_this.username='wade';
console.log(_this.username);
