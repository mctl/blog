

```js
<input type="file"
   id="avatar" name="avatar"
   accept="image/png, image/jpeg">
```

```js

let file = document.getElementById("avatar").files[0];

//data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAS...
//后端处理时，【,】前的可能需要截掉
//用element等组件时传入可能略有不同，需要为File类型
getBase64(file).then(base64 => { console.log(base64)})

//传入File，得到base64串
function getBase64(file) {
	return new Promise(function (resolve, reject) {
		let reader = new FileReader();
		let imgResult = "";
		reader.readAsDataURL(file);
		reader.onload = function () {
			imgResult = reader.result;
		};
		reader.onerror = function (error) {
			reject(error);
		};
		reader.onloadend = function () {
			resolve(imgResult);
		};
	});
}
```
