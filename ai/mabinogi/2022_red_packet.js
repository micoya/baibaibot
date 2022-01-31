const http = require('http')

const PACKET_LIST = [
  { time: '2022-1-28 10:0:0', item: '支票2330000（策划君的大红包）' },
  { time: '2022-1-28 14:0:0', item: '黑白钢琴' },
  { time: '2022-1-28 18:0:0', item: '强化的战斗经验药水(30分钟)' },
  { time: '2022-1-28 22:0:0', item: '紫黑闪（金属）' },

  { time: '2022-1-29 10:0:0', item: '幸运红色改造石' },
  { time: '2022-1-29 14:0:0', item: '华丽半神之翼' },
  { time: '2022-1-29 18:0:0', item: '彩虹染色套装(金属固染)' },
  { time: '2022-1-29 22:0:0', item: 'devcat耳套' },

  { time: '2022-1-30 10:0:0', item: '忘却的秘药' },
  { time: '2022-1-30 14:0:0', item: '至尊全技能修炼药水(1天)' },
  { time: '2022-1-30 18:0:0', item: '红莲之羽翼' },
  { time: '2022-1-30 22:0:0', item: '星波王瓦库-扎库迷你玩偶' },

  { time: '2022-1-31 10:0:0', item: '宠物转生秘药' },
  { time: '2022-1-31 14:0:0', item: '特制战斗力弱化药水S' },
  { time: '2022-1-31 18:0:0', item: '尔格初级强化礼包' },
  { time: '2022-1-31 22:0:0', item: '红黑闪染(1固染+2昔染)' },

  { time: '2022-2-1 10:0:0', item: '白色闪染(1固染+2昔染)' },
  { time: '2022-2-1 14:0:0', item: '无尽冬日雪绒花翅膀' },
  { time: '2022-2-1 18:0:0', item: '古代黄金结晶' },
  { time: '2022-2-1 22:0:0', item: '暖心蝴蝶结尾巴' },

  { time: '2022-2-2 10:0:0', item: '五尾狐尾巴' },
  { time: '2022-2-2 14:0:0', item: '免费修理箱套装' },
  { time: '2022-2-2 18:0:0', item: '彩虹染色套装(普通固染)' },
  { time: '2022-2-2 22:0:0', item: '皇家学院校服——夏季款(女生用)' },

  { time: '2022-2-3 10:0:0', item: '贝特林任务精英通行证 -背水之阵' },
  { time: '2022-2-3 14:0:0', item: '紫黑闪(普通)' },
  { time: '2022-2-3 18:0:0', item: '冷酷的雪绒花翅膀' },
  { time: '2022-2-3 22:0:0', item: '皇家学院校服-夏季款(男生用)' },

  { time: '2022-2-4 10:0:0', item: '开学英伦大衣(男式)' },
  { time: '2022-2-4 14:0:0', item: '迪恩药水' },
  { time: '2022-2-4 18:0:0', item: '幸运蓝色改造石' },
  { time: '2022-2-4 22:0:0', item: '无限制地下城通行证' },

  { time: '2022-2-5 10:0:0', item: '尔格中级强化礼包' },
  { time: '2022-2-5 14:0:0', item: '开学英伦大衣(女式)' },
  { time: '2022-2-5 18:0:0', item: '金鸡蛋' },
  { time: '2022-2-5 22:0:0', item: '粉白闪(金属)' },

  { time: '2022-2-6 10:0:0', item: '福格斯免费修理券' },
  { time: '2022-2-6 14:0:0', item: '褐棕闪染(1固染+ 2普染)' },
  { time: '2022-2-6 18:0:0', item: 'AP药水(100点)' },
  { time: '2022-2-6 22:0:0', item: '圣洁之羽翼' },

  { time: '2022-2-7 10:0:0', item: '尔格高级强化礼包' },
  { time: '2022-2-7 14:0:0', item: '珠光手镯' },
  { time: '2022-2-7 18:0:0', item: '天蓝固染(1固染+2普染)' },
  { time: '2022-2-7 22:0:0', item: '蕾丝睡衣' },

  { time: '2042-2-7 22:0:0', item: '活动结束' },
]

let AUTO_SEND_GROUPS = [

]

const mabinogi_red_packet_list = callback => {
  callback(JSON.stringify(AUTO_SEND_GROUPS))
}

const addZero = (num) => {
  return num < 10? `0${num}` : num
}

const mabinogi_red_packet = (callback, auto = false) => {
  let tar
  for(let i = 0; i < PACKET_LIST.length; i ++){
    tar = PACKET_LIST[i]
    if(Date.now() < new Date(tar.time).getTime()) {
      break
    }
  }
  let ts = ~~((new Date(tar.time) - Date.now())/ 1000)
  if(auto && ts > 2000) {
    callback()
  } else {
    callback(`${~~(ts / 60)}分${addZero(~~(ts % 60))}秒后红包开启，下次活动奖励：${tar.item}`)
  }
}

const mabinogi_red_packet_set = (groupId, port, callback) => {
  AUTO_SEND_GROUPS[groupId] = {
    groupId,
    port
  }
  callback('已开启活动提示')
}

const mabinogi_red_packet_remove = (groupId, port, callback) => {
  delete AUTO_SEND_GROUPS[groupId]
  callback('已关闭活动提示')
}

const startTimeout = () => {
  let timeLeft = 3600000 + 5 * 60 * 1000 - new Date().getTime() % 3600000
  setTimeout(() => {
    mabinogi_red_packet(res => {
      if(res.trim().length > 0){
        if(Object.values(AUTO_SEND_GROUPS).length) {
          Object.values(AUTO_SEND_GROUPS).forEach(info => {
            let options = {
              host: '192.168.17.52',
              port: info.port,
              path: `/send_group_msg?group_id=${info.groupId}&message=${encodeURIComponent(`G21BOSS自动报时\n\n${res}`)}`,
              method: 'GET',
              headers: {}
            }
            let req = http.request(options);
            req.on('error', function(err) {
              console.log('req err:');
              console.log(err);
            });
            req.end();
          })
        }
      }
    }, true)
    startTimeout()
  }, timeLeft)
}

startTimeout()

module.exports = {
  mabinogi_red_packet,
  mabinogi_red_packet_list,
  mabinogi_red_packet_set,
  mabinogi_red_packet_remove,
}