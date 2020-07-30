// 自定义投食次数
var JD_HOST = "https://api.m.jd.com/client.action?";

async function start() {
	var needFeedTimes = prompt('请输入要投食的次数', 10)
	
	console.log('您需要投食'+ needFeedTimes + '次');
	
	do {
		console.log('还需投食' + needFeedTimes + '次');
		var res = await feed();
		console.log('喂食结果: ', res);
		needFeedTimes --;
		await sleep(2);
	}while(needFeedTimes > 0)
	
	await energyCollect();
	console.log('投食结束');
}

function energyCollect() {
	console.log('开始收取好感度');
	return new Promise((rs, rj)=> {
		let function_id = arguments.callee.name.toString();
		request(function_id).then(response=> {
			console.log('收取好感度完成:', response);
			rs()
		})
	})
	
	
	
	
	
	
}

function sleep(s) {
	return new Promise((rs, rj)=> {
		setTimeout(function() {
			rs();
		}, s * 1000);
	})
}

function feed() {
	return new Promise((rs, rj)=> {
		request('feedPets').then(response=> {
			rs(response);
		})
	})
}

async function request(function_id, body = {}) {
	await sleep(3); //歇口气儿, 不然会报操作频繁
	return new Promise((resolve, reject) => {
		fetch(JD_HOST + 'functionId=' + function_id + '&appid=wh5&loginWQBiz=pet-town&body=' + JSON.stringify(body), {
				credentials: "include",
			})
			.then(res => {
				return res.json();
			})
			.then((response) => {

				resolve(response);
			});
	})
}

start()