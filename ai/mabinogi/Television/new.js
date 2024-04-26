const fs = require("fs-extra");
const path = require("path-extra");
const mysql = require('mysql2')
const {render} = require('./render')
const { IMAGE_DATA } = require('../../../baibaiConfigs')

const { MongoClient } = require('mongodb')
const { mongourl } = require('../../../baibaiConfigs')

let mysqlPool, mgoClient

const createMysqlPool = async () => {
  const pool = mysql.createPool(Object.assign(
    {
      connectionLimit: 10,
      database: 'dungeon_reward_records'
    },
    fs.readJsonSync(path.join(__dirname, '.secret.json'))
  ))
  mysqlPool = pool.promise();
}

const checkLink = async () => {
  if(!mysqlPool) {
    await createMysqlPool()
  }
  if(!mgoClient) {
    try {
      mgoClient = await MongoClient.connect(mongourl)
    } catch (e) {
      console.log('MONGO ERROR FOR NEW MBTV MODULE!!')
      console.log(e)
    }
  }
}

const help = callback => {
  callback('这是帮助')
}


const formatTime = ts => {
  let d = new Date(ts)
  return `${d.getFullYear()}-${addZero(d.getMonth() + 1)}-${addZero(d.getDate())} ${addZero(d.getHours())}:${addZero(d.getMinutes())}:${addZero(d.getSeconds())}`
}
const addZero = n => n < 10 ? ('0' + n) : n

const mabiTelevision = async (content, qq, callback) => {
  // if(!content.trim().length) {
  //   help(callback)
  //   return
  // }
  await checkLink()
  const svc = mgoClient.db('db_bot').collection('cl_mabinogi_user_server')

  let sv = Object.entries({
    'ylx': 'ylx',
    '伊鲁夏': 'ylx',
    '猫服': 'ylx',
    'yt': 'yate',
    '亚特': 'yate',
  }).find(([key]) => content.startsWith(key))

  if(sv) {
    content = content.substring(sv[0].length).trim()
    sv = sv[1]
    await svc.save({_id: qq, sv})
  } else {
    const svInfo = await svc.findOne({_id: qq})
    if(svInfo) {
      sv = svInfo.sv
    } else {
      await svc.save({_id: qq, sv: 'ylx'})
      sv = 'ylx'
    }
  }
  if(content.length > 20 || content === 'help') {
    help(callback)
    return
  }
  let table = {
    'ylx': 'mabi_dungeon_reward_records',
    'yate': 'mabi_dungeon_reward_records_yate'
  }[sv]
  const filter = content.trim()
  const limit = 20
  let queryParams = [];
  let whereClause = '';

  if(filter.length) {
    if(filter.indexOf('-') > -1) {
      let sp = filter.split('-')
      let [rewordFilter, nameFilter, dungeonFilter] = sp
      if (rewordFilter || nameFilter || dungeonFilter) {
        whereClause = `WHERE${sp.map((x, i) => x && [' reward LIKE ?', ' character_name LIKE ?', ' dungeon_name LIKE ?'][i]).filter(x => x).join(' OR')}`
        queryParams = sp.map(x => x && `%${x}%`).filter(x => x)
      }
    } else {
      whereClause = `WHERE reward LIKE ? OR character_name LIKE ? OR dungeon_name LIKE ?`;
      queryParams = [`%${filter}%`, `%${filter}%`, `%${filter}%`];
    }
  }
  const query =
    `
    SELECT *
    FROM ${table}
    ${whereClause}
    ORDER BY data_time DESC 
    LIMIT ?
    `
  queryParams.push(limit)
  const [row, fields] = await mysqlPool.query(query, queryParams)
  // console.log(row)
  // const outputDir = path.join(__dirname, 'text.jpg')
  const outputDir = path.join(IMAGE_DATA, 'mabi_other', `MabiTV.png`)
  await render(row, {
    title: `出货记录查询：${{'ylx': '猫服', 'yate': '亚特'}[sv]}`,
    output: outputDir,
    columns: [
      {
        label: '角色名称',
        key: 'character_name',
      },
      {
        label: '物品名称',
        key: 'reward',
      },
      {
        label: '地下城名称',
        key: 'dungeon_name',
      },
      {
        label: '时间',
        key: 'data_time',
        format: time => formatTime(new Date(time).getTime())
      },
      {
        label: '频道',
        key: 'channel',
      },
    ]
  })

  console.log(`保存MabiTV.png成功！`)
  let imgMsg = `[CQ:image,file=${path.join('send', 'mabi_other', `MabiTV.png`)}]`
  callback(imgMsg)
}

module.exports = {
  mabiTelevision
}