// const ak = require('./arkNightsRecruit')
// const akc = require('./arkNightsCalc')
// const aks = require('./arkNightsCharacter')
// const akk = require('./arkNightsSkill')
// const akl = require('./arkNightsRecruitLimit')
// const {baiduocr} = require('../image/baiduocr');
// const akb = require('./arkNightsBuildingTheme')
// const akc = require('./arkNightChallenge')
// const akcc = require('./arkNightsCharacterCompare')
const { calendar } = require('./arkNightsCalendar')
const c = m => {
  console.log('===== output =====')
  console.log(m)
}

calendar(c)
// akc('213', c)
// akb('111', '陈的办公室', c)
// akcc('111', '1551-蛇屠箱', c)
// akcc('111', '\\S+', c)
// console.log(akk('skchr_plosis_2', '3'))
// akc('123456', '5 1-1 1-80   ', c)
// aks('123456', '初雪', c)
// aks('123456', '伊芙 8', c)
// aks('123456', '安洁 8', c)
// aks('123456', '空爆 8', c)
// aks('123456', '黑角 8', c)
// aks('123456', '-2 8', c)
// aks('123456', '艾雅法拉 8', c)
// aks('123456', '夜莺 8', c)
// console.log(Date.now())
// aks('123456', '\\S+', c)
// aks('123456', '空$', c)
// aks('123456', '推进 9', c)
// aks('123456', '\\S+', c)
// akl()
// ak(123,'[CQ:image,file=D92B8C3ECBA963C3563701F900F72FF1.jpg,url=https://gchat.qpic.cn/gchatpic_new/799018865/577587780-2346967126-D92B8C3ECBA963C3563701F900F72FF1/0?vuin=2375373419&term=2]', c)
// console.log(Date.now())
// ak(123132, '术士 先锋 近战 削弱 输出', c)
// ak(123132, '远程 治疗 女性 群攻', c)
// ak(123132, '高级资深处男', c)
// ak('[CQ:image,file=9A38768CEBF470A313C6A4B7441B9242.png,url=https://gchat.qpic.cn/gchatpic_new/912008974/549823679-3005667254-9A38768CEBF470A313C6A4B7441B9242/0?vuin=2375373419&term=2]', c)
// ak('[CQ:image,file=200EB4D8FBB1A7B34FA47E4240C895BA.png,url=https://gchat.qpic.cn/gchatpic_new/771210053/549823679-2274281053-200EB4D8FBB1A7B34FA47E4240C895BA/0?vuin=2375373419&term=2][CQ:image,file=200EB4D8FBB1A7B34FA47E4240C895BA.png,url=https://gchat.qpic.cn/gchatpic_new/771210053/549823679-2274281053-200EB4D8FBB1A7B34FA47E4240C895BA/0?vuin=2375373419&term=2]', c)
// baiduocr('https://gchat.qpic.cn/gchatpic_new/799018865/720801895-2187320775-2F46694E65760AE285D40837BF1D1525/0?term=2', d => {
//   console.log(d.replace(/干员/g, '\n').split('\n').filter(x => x.trim() != ''))
// })

