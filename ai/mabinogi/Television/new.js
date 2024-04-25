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

const mabiTelevision = async (content, qq, callback) => {
  if(!content.trim().length) {
    help(callback)
    return
  }
  await checkLink()
  const svc = mgoClient.db('db_bot').collection('cl_mabinogi_user_server')
  let sv
  if(content.startsWith('ylx') || content.startsWith('伊鲁夏')) {
    sv = 'ylx'
    content = content.substring(3).trim()
  }
  if(content.startsWith('猫服')) {
    sv = 'ylx'
    content = content.substring(2).trim()
  }
  if(content.startsWith('yt') || content.startsWith('亚特')) {
    sv = 'yate'
    content = content.substring(2).trim()
  }
  if(sv) {
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
  let table = {
    'ylx': 'mabi_dungeon_reward_records',
    'yate': 'mabi_dungeon_reward_records_yate'
  }[sv]
  const filter = content.trim()
  const limit = 20
  const query =
    `
    SELECT *
    FROM ${table}
    ${(filter && filter.length > 1) ? `
    WHERE reward LIKE '%${filter}%'
      OR dungeon_name LIKE '%${filter}%'
      OR character_name LIKE '%${filter}%'
    ` : ''}
    ORDER BY data_time DESC 
    LIMIT ${limit}
    `
  const [row, fields] = await mysqlPool.query(query)
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

// mabiTelevision('苍白', 123456, d => {
//   console.log(d)
// })