const { readFileSync } = require('fs')
const { join } = require('path')
const MongoClient = require('mongodb').MongoClient
const { mongourl, IMAGE_DATA } = require('../../../baibaiConfigs');
const { cut, load, extract } = require("nodejieba")
const nodeHtmlToImage = require('node-html-to-image')
const path = require("path");

let echart = readFileSync(join(__dirname, 'echart.min.js'), 'utf-8')
let echartWordcloud = readFileSync(join(__dirname, 'echart-wordcloud.js'), 'utf-8')

let client

const analysisChatData = data => {
	load({
		userDict: join(__dirname, 'userdict.txt'),
	})
	let msgList = []
	data.forEach(msg => {
		if(msg.d && !msg.d.startsWith('http') && msg.uid != 981069482){
			let filterCQ = msg.d.split('[CQ:').map((x, i) => i ? x.split(']')[1]: x).filter(x => x.trim()).join('')
			let splitEn = Array.from(filterCQ.matchAll(/[a-zA-Z0-9]+/g)).map(x => x[0])

			splitEn.forEach(en => {
				msgList.push(en)
				filterCQ = filterCQ.split(en).join('')
			})

			msgList.push(filterCQ)
		}
	})
	return extract(msgList.join('\n'), 256)
}

const fetchGroupData = async groupId => {
	let groupData = await client.db('db_bot').collection('cl_chat').find({
		_id: { $gt: new Date(Date.now() - 1000*60*60*24) },
		gid: groupId
	}).toArray()
	console.log(`===> group data length: ${groupData.length}`)
	return analysisChatData(groupData)
}

const renderChatPersonas = async (groupId, callback) => {
	if(!client) {
		try {
			client = await MongoClient.connect(mongourl)
		} catch (e) {
			console.log('MONGO ERROR FOR PERSONAS MODULE!!')
			console.log(e)
		}
	}

	let extractArr = await fetchGroupData(groupId)
	let keyWords = {}
	extractArr.forEach(item => {
		keyWords[item.word] = ~~item.weight
	})

	let output = path.join(IMAGE_DATA, 'other', `${groupId}.png`)
	// let output = path.join(`${groupId}.png`)

	nodeHtmlToImage({
		output,
		html: `
			<html>
			<head>
				<meta charSet="utf-8">
				<script>
					${echart}
				</script>
				<script>
					${echartWordcloud}
				</script>
				<style>
					html, body, #main {
						width: 100%;
						height: 100%;
						margin: 0;
						background-color: #0a0905;
					}
				</style>
			</head>
			<body>
			<div id='main'></div>
			<script>
				var chart = echarts.init(document.getElementById('main'));
				var keywords = ${JSON.stringify(keyWords)}
			
				var data = [];
				for (var name in keywords) {
					data.push({
						name: name,
						value: Math.sqrt(keywords[name])
					})
				}
			
				var option = {
					series: [{
						type: 'wordCloud',
						sizeRange: [4, 150],
						rotationRange: [0, 0],
						gridSize: 0,
						shape: 'pentagon',
						drawOutOfBound: false,
						keepAspect: true,
						textStyle: {
							fontWeight: 'bold',
							color: function () {
								return 'rgb(' + [
									Math.round(Math.random() * 200) + 50,
									Math.round(Math.random() * 50),
									Math.round(Math.random() * 50) + 50
								].join(',') + ')';
							}
						},
						emphasis: {
							textStyle: {
								color: '#528'
							}
						},
						data: data.sort(function (a, b) {
							return b.value - a.value;
						})
					}]
				};
				chart.setOption(option);
			</script>
			</body>
			</html>
		`
	})
		.then(() => {
			console.log(`保存${groupId}.png成功！`)
			let imgMsg = `[CQ:image,file=${join('send', 'other', `${groupId}.png`)}]`
			callback(imgMsg)
		})
}

module.exports = {
	renderChatPersonas
}
// renderChatPersonas(205700800)