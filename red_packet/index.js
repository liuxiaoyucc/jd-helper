
var JD_RED_PARKET_HOST = "https://api.m.jd.com/api?appid=jd_mp_h5&";


var taskInfo = null;

function* start() {
	yield taskHomePage(); // 初始化任务
	// yield active8();
}

// 请求
async function request(function_id, body = {}) {

	var timestamp = new Date().getTime();
	return new Promise((resolve, reject) => {
		fetch(JD_RED_PARKET_HOST + 'functionId=' + function_id +
				'&loginType=2&client=jd_mp_h5&clientVersion=9.0.0&osVersion=AndroidOS&d_brand=UnknownTablet&d_model=UnknownTablet&t=' +
				timestamp, {
					body: 'body=' + JSON.stringify(body),
					cache: 'no-cache',
					method: 'POST',
					headers: {
						'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
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



function taskHomePage() {
	console.log('全民领红包任务初始化');
	request(arguments.callee.name.toString()).then(response => {
		try {
			if (response.code == 0 && response.rtn_code == 0 && response.data.biz_code == 0) {
				taskInfo = response.data.result.taskInfos;
				console.log('任务初始化完成: ', taskInfo);
				step.next();
			}
		} catch (e) {
			console.log(e);
			console.log('初始化任务异常');
			step.return();
		}
	})
}



function getTaskDetailForColor(taskType) {
	console.log('获取任务详情');
	
	return new Promise((resolve, reject)=> {
		
		request(arguments.callee.name.toString(),  {taskType:"4"}).then(response => {
			console.log(response);
			try {
				let taskDetail = null;
				if (response.code == 0 && response.rtn_code == 0 && response.data.biz_code == 0) {
					taskDetail = response.data.result.advertDetails;
					console.log('任务详情: ', taskDetail);
				}
				resolve(taskDetail);
			} catch (e) {
				console.log(e);
				reject(e);
				console.log('获取任务详情异常');
			}
		})
		
	})
	
}

function taskReportForColor(taskType, detailId) {
	console.log('开始完成任务');
	
	return new Promise((resolve, reject)=> {
		
		request(arguments.callee.name.toString(), {taskType: taskType + '', detailId: detailId}).then(response => {
			console.log(response);
			try {
				
				if (response.code == 0 && response.rtn_code == 0 && response.data.biz_code == 0) {
					let result = response.data.result;
					console.log('完成任务结果: ', result);
				}
				resolve();
			} catch (e) {
				console.log(e);
				reject(e);
				console.log('完成任务异常');
			}
		})
		
	})
}

/**
 * 浏览8个精选活动任务
 */
async function active8() {
	let actives = await getTaskDetailForColor(4);
	console.log(actives);
	return;
	
	for (let active of actives) {
		let detail_id = active.id; //通过这个id完成
		await taskReportForColor(detail_id);
	}
	
	
	step.next();
}

var step = start();
step.next();
