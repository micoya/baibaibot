const fs = require('fs-extra')
const path = require('path-extra')
const http = require('http')
const md5 = require("md5")
const nodeHtmlToImage = require('node-html-to-image')
const { IMAGE_DATA, myip } = require(path.join(__dirname, '..', 'baibaiConfigs.js'))
const font2base64 = require('node-font2base64')

const Corp_Bold = font2base64.encodeToDataUrlSync(path.join(__dirname, '..', 'font', 'Corp-Bold.otf'))



const fetchGroupUsers = (groupid, port) =>
	new Promise(resolve => {
		let url = `http://${myip}:${port}/get_group_member_list?group_id=${groupid}`
		http.get(url, (res) => {
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => { rawData += chunk; });
			res.on('end', () => {
				try {
					const parsedData = JSON.parse(rawData);
					const groupUsers = parsedData.data.map(x => {
						let nid = x.card || x.nickname, alias = nid
						if(nid.length > 7) {
							alias = `${nid.substring(0, 7)}...`
						}
						return {
							uid: x.user_id,
							nid,
							alias
						}
					})
					resolve(groupUsers);
				} catch (e) {
					console.error(e.message);
					resolve([])
				}
			});
		}).on('error', (e) => {
			console.error(`Got error: ${e.message}`);
			resolve([])
		})
	})

const searchUser = async (port, groupId, qq) => {
	let users = await fetchGroupUsers(groupId, port)
	return users.filter(x => x.uid === qq)[0]
}

const createUserRp = id => {
	let str = `${id}${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
	let md = md5(str)
	let rp = parseInt(md.substring(0, 15), 16).toString().split('').reduce((p, c) => p + parseInt(c), 0)
	let rpFixType = parseInt(md.substring(15, 16), 16) % 3
	let rpFix = parseInt(md.substring(16, 20), 16).toString().split('').reduce((p, c) => p + parseInt(c), 0)
	switch (rpFixType){
		case 0:
			rp += rpFix
			break
		case 1:
			rp -= rpFix
			break
	}
	if(rp < 0){
		rp = Math.abs(rp)
	}
	if(rp > 100){
		if(rp > 105){
			rp = 100 - (rp - 105)
		}
		else {
			rp = 100
		}
	}
	return rp
}

const jrrp = async (qq, groupId, port, callback, other) => {
	let userInfo = await searchUser(port, groupId, qq)
	console.log(`====== jrrp =======`)
	console.log(userInfo)
	if(!userInfo) {
		return
	}
	let rp = createUserRp(qq || other)
	console.log(rp)

	let output = path.join(IMAGE_DATA, 'rp', `${qq}_jrrp.png`)

	let progressColor = '#f00'
	if(rp > 30) {
		progressColor = '#ff0'
	}
	if(rp > 60) {
		progressColor = '#0ff'
	}
	if(rp > 90) {
		progressColor = '#0f0'
	}

	nodeHtmlToImage({
		output,
		html: `
<html>
  <head>
    <title></title>
    <style>
    	@font-face {
        font-family: 'Corp_Bold';
        src: url(${Corp_Bold}) format('opentype');
      }
    	body {
    		width: 600px;
    	}
    	.main-container {
    		padding: 30px;
    		position: relative;
    	}
    	.main-container .user-nick{
    		font-size: 32px;
    		font-weight: bold;
    		color: #333;
    	}
    	.main-container .rp-progress-container{
    		margin-top: 20px;
    		width: 100%;
    		height: 30px;
    		border: 1px solid #333;
    		position: relative;
    	}
    	.main-container .rp-progress-container .rp-progress{
    		position: absolute;
    		left: 0;
    		top: 0;
    		height: 30px;
    	}
    </style>
  </head>
  <body>
  	<div class="main-container">
  		<div class="user-nick">${userInfo.nid} 今天的运势指数是: ${rp} %</div>
  		<div class="rp-progress-container">
  			<div class="rp-progress" style="background-color: ${progressColor}; width: ${rp}%"></div>
			</div>
		</div>
  </body>
</html>
`
	})
		.then(() => {
			console.log(`保存${qq}_jrrp.png成功！`)
			let imgMsg = `[CQ:image,file=${path.join('send', 'mabi_other', `${qq}_jrrp.png`)}]`
			callback(imgMsg)
		})


}

module.exports = {
	jrrp
}