var JD_FRUIT_HOST = 'https://api.m.jd.com/client.action?';
var farmTask = null;
var farmInfo = null;
var clockInfo = null;

var timeout = 3;
var shareCodes = [
	'121ada81cdfd4085b07d1ce871ded341',
]

async function request(function_id, body = {}) {
	await sleep();
	return new Promise((resolve, reject)=> {
		fetch(JD_FRUIT_HOST + 'functionId=' + function_id + '&appid=wh5&body=' + JSON.stringify(body), {
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

function *step() {
	console.log('0元水果任务开始');
	yield initForFarm();
	yield taskInitForFarm();
	yield clockInInitForFarm();
	yield signForFarm(); // 签到
	
	yield waterRainForFarm(); // 水滴雨, 每天两次, 相隔3个小时才可以进行下一次
	
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
	console.log('即将开始每日浇水任务');
	console.log('当前水滴剩余: ' + farmInfo.farmUserPro.totalEnergy);
	
	
	if (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
		yield waterGoodForFarm();
		//这里还需要领取一下浇水奖励
		yield firstWaterTaskForFarm();
		yield totalWaterTaskForFarm();
	}
	
	console.log('finished 水果任务完成!');
	
	//这个是集水果换奖励的, 现在app中入口找不到了.....
	yield browserForTurntableFarm(1);
	yield browserForTurntableFarm(2);
	
	yield masterGotFinishedTaskForFarm();
	console.log('全部任务结束');
}


/**
 * 集卡抽奖
 */
function lotteryForTurntableFarm() {
	
	request(arguments.callee.name.toString(), {type: 1}).then(response=> {
		console.log(response);
		Task.next();
	});
}

function browserForTurntableFarm(type) {
	if (type === 1) {
		console.log('浏览爆品会场');
	}
	if (type === 2) {
		console.log('领取浏览爆品会场奖励');
	}
	
	request(arguments.callee.name.toString(), {type: type}).then(response=> {
		console.log(response);
		Task.next();
	});
	// 浏览爆品会场8秒
}

/**
 * 被水滴砸中
 * 要弹出来窗口后调用才有效, 暂时不知道如何控制
 */
function gotWaterGoalTaskForFarm() {
	request(arguments.callee.name.toString(), {type: 3}).then(response=> {
		console.log(response);
		Task.next();
	});
}

/**
 * 10次浇水
 */
function totalWaterTaskForFarm() {
	let functionId = arguments.callee.name.toString();
	
	request(functionId).then(response=> {
		console.log('10次浇水奖励领取结果: ', response);
		Task.next();
	});
	
}


function firstWaterTaskForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId).then(response=> {
		console.log('首次浇水奖励领取结果: ', response);
		Task.next();
	});
	
}

/**
 * 初始化农场, 可获取果树及用户信息, 同时传入shareCode可为好友助力
 */
async function initForFarm() {
	console.log('初始化农场信息, 请稍候...');
	let functionId = arguments.callee.name.toString();
	let body = {};
	if (shareCodes.length) {
		console.log('有好友需要助力');
		for (let code of shareCodes) {
			console.log('开始助力好友: ', code);
			let response = await request(functionId, {
				shareCode: code
			});
			if (response.code == 0) {
				console.log(code + ': 助力结果: ', response.helpResult);
				farmInfo = response;
			}
		}
	}
	
	if (farmInfo.farmUserPro) {
		console.log('当前账号shareCode为: ', farmInfo.farmUserPro.shareCode);
	}
	
	Task.next();
}

// 浇水动作
async function waterGoodForFarm() {
	
	do {
		console.log('已浇水 ' + farmTask.totalWaterTaskInit.totalWaterTaskTimes + ' 次');
		let waterResult = await request(arguments.callee.name.toString());
		console.log('本次浇水结果: ', waterResult);
		if (waterResult.code != 0) {//异常中断
			break
		}
		farmTask = await request('taskInitForFarm');
		
	}while (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit)
	
	setTimeout(function() {
		Task.next();
	}, 1000);
}

/**
 * 浏览广告任务
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
function browseAdTaskForFarm(advertId, type) {
	let functionId = arguments.callee.name.toString();
	request(functionId, {advertId, type}).then(response=> {
		Task.next(response);
	});
}

function waterRainForFarm() {
	console.log('开始水滴雨');
	request(arguments.callee.name.toString(), {type: 1, hongBaoTimes: 100}).then(response=> { //农场签到改版后的接口
		console.log('水滴雨结果: ' , response);
		Task.next();
	});
}

function clockInInitForFarm() {
	console.log('初始化新版签到信息');
	var timestamp = new Date().getTime();
	request(arguments.callee.name.toString(), {timestamp: timestamp, channel: 2}).then(response=> { //农场签到改版后的接口
		console.log('初始化新版签到结果: ' , response);
		clockInfo = response;
		Task.next();
	});
}

async function signForFarm() {
	console.log('准备签到, 请稍候...');
	
	let old_sign_result = await request(arguments.callee.name.toString());
	let new_sign_result = await request('clockInForFarm', {type: 1});
	console.log('旧版签到结果: ' , old_sign_result);
	console.log('新版签到结果: ' , new_sign_result);
	
	setTimeout(()=> {
		Task.next();
	}, timeout * 1000);
	
}

// 初始化任务列表
function taskInitForFarm() {
	console.log('任务初始化, 请稍候...');
	let functionId = arguments.callee.name.toString();
	request(arguments.callee.name.toString()).then(response=> {
		if (response.code == 0) {
			farmTask = response;
			console.log('任务初始化成功: ', response);
			Task.next();
		}else {
			console.log('任务初始化失败: ', response);
			Task.return();
		}
		
	});
}

/**
 * 初始化集卡活动信息
 */
function initForTurntableFarm() {
	request(arguments.callee.name.toString()).then(response=> {
		console.log(response);
		Task.next();
	});
}


//领取领取额外奖励的动作
function masterGotFinishedTaskForFarm() {
	console.log("领取助力人数已满奖励")
	let functionId = arguments.callee.name.toString();
	request(arguments.callee.name.toString()).then(response=> {
		console.log('领取结果: ', response);
		Task.next();
	})
}

function sleep() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, timeout * 1000);
	})
	
}


var Task = step();
Task.next(); //开始执行
