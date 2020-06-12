// 自定义投食次数

async function start() {
	var needFeedTimes = prompt('请输入要投食的次数', 10)
	
	console.log('您需要投食'+ needFeedTimes + '次');
	
	do {
		console.log('还需投食' + needFeedTimes + '次');
		await feed();
		needFeedTimes --;
		await sleep(2);
	}while(needFeedTimes > 0)
	
	console.log('投食结束');
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
		rs();
	})
}

start()