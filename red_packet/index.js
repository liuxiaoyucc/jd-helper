var JD_HOST = "https://api.m.jd.com/api?appid=jd_mp_h5&";

var taskInfo = null;

function* start() {
	yield taskHomePage(); // 初始化任务
}

// 请求
async function request(function_id, body = {}) {

	var timestamp = new Date().getTime();
	return new Promise((resolve, reject) => {
		fetch(JD_HOST + 'functionId=' + function_id +
				'&loginType=2&client=jd_mp_h5&clientVersion=9.0.0&osVersion=AndroidOS&d_brand=UnknownTablet&d_model=UnknownTablet&t=' +
				timestamp, {
					body: JSON.stringify(JSON.stringify(body)),
					cache: 'no-cache',
					method: 'POST',
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

var step = start();
step.next();
