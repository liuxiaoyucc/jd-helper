let JD_FRUIT_HOST = 'https://api.m.jd.com/client.action?';
let farmTask = null;
let farmInfo = null;

function request(function_id, body = {}) {
	console.log(function_id);
	
	fetch(JD_FRUIT_HOST + 'functionId=' + function_id + '&appid=wh5&body=' + JSON.stringify(body), {
			credentials: "include",
		})
		.then(res => {
			return res.json();
		})
		.then((response) => {
			sleep(response);
			
		});

}

function* step() {
	
	farmTask = yield taskInitForFarm();
	console.log('当前任务详情: ' , farmTask);
	farmInfo = yield initForFarm();
	console.log('农场初始化数据: ' , farmInfo);
	
	if (!farmTask.signInit.todaySigned) {
		let signResult = yield signForFarm(); //签到
		console.log('签到结果: ' , signResult);
	}
	
	let adverts = farmTask.gotBrowseTaskAdInit.userBrowseTaskAds
	for (let advert of adverts) { //开始浏览广告
		if (advert.limit <= advert.hadFinishedTimes) { 
			console.log(advert.mainTitle + ' 已完成');
			continue;
		}
		console.log('正在进行广告浏览任务: ' + advert.mainTitle);
		let browseResult = yield browseAdTaskForFarm(advert.advertId, 0);
		console.log('广告浏览任务结果: ' , browseResult);
		if (browseResult.code == 0) {
			let browseRwardResult = yield browseAdTaskForFarm(advert.advertId, 1);
			console.log('领取浏览广告奖励结果: ' , browseRwardResult);
		}
	}
	console.log('所有广告浏览任务结束, 即将开始每日浇水任务');
	
	console.log('当前水滴剩余: ' + farmInfo.farmUserPro.totalEnergy);
	if (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
		
		do {
			console.log('已浇水 ' + farmTask.totalWaterTaskInit.totalWaterTaskTimes + ' 次');
			let waterResult = yield waterGoodForFarm();
			console.log('本次浇水结果: ', waterResult);
			if (waterResult.code != 0) {//异常中断
				break
			}
			farmTask = yield taskInitForFarm();
		}while (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit)
		
		//这里还需要领取一下浇水奖励
		let firstWaterReward = yield firstWaterTaskForFarm();
		console.log('首次浇水奖励领取结果: ', firstWaterReward);
		let totalWaterReward = yield totalWaterTaskForFarm();
		console.log('10次浇水奖励领取结果: ', totalWaterReward);
		
		console.log('finished');
	}
	
	
	
}

function totalWaterTaskForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId);
}

function firstWaterTaskForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId);
}

/**
 * 初始化农场, 可获取果树及用户信息
 */
function initForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId);
}

// 浇水动作
function waterGoodForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId);
}

/**
 * 浏览广告任务
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
function browseAdTaskForFarm(advertId, type) {
	let functionId = arguments.callee.name.toString();
	request(functionId, {advertId, type});
}

function signForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId);
}

// 初始化任务列表
function taskInitForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId);
}

function sleep(response) {
	console.log('休息一下');
	setTimeout(()=> {
		console.log('休息结束');
		Task.next(response)
	}, 2000);
}


var Task = step();
Task.next(); //开始执行
