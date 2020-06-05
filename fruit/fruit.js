let JD_FRUIT_HOST = 'https://api.m.jd.com/client.action?';
let TASK_MAP = {
	
}


function request(function_id, body = {}) {
	console.log(function_id);
	fetch(JD_FRUIT_HOST + 'functionId='+function_id+'&appid=wh5&body=' + JSON.stringify(body), {
		credentials: "include",
	})
	.then(res => {
		return res.json();
	})
	.then((response)=> {
		Task.next(response)
	});

}

function* step() {
    let farmTask = yield taskInitForFarm();
    console.log(farmTask);
	
	
    
    

}

// 初始化任务列表
function taskInitForFarm() {
	let functionId = arguments.callee.name.toString();
	request(functionId);
}


var Task = step();
Task.next();//开始执行

