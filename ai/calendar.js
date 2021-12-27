const MongoClient = require('mongodb').MongoClient
const MONGO_URL = 'mongodb://192.168.17.52:27050'

let userHash = {

}
let userDelHash = {

}
let client

const calendar = async (content, author, groupId, callback, type = 'insert') => {
  if(!client) {
    try {
      client = await MongoClient.connect(MONGO_URL)
    } catch (e) {
      console.log('MONGO ERROR FOR CALENDAR MODULE!!')
      console.log(e)
    }
  }
  let sp = content.split('\n').map(x => x.trim()).filter(x => x)
  switch(type) {
    case "search":
      if(content.trim()) {
        searchCalendar(content, groupId, callback)
      } else {
        help(callback)
      }
      break
    case "insert":
      if(userHash[author]) {
        delete userHash[author]
      }
      if(sp.length >= 4) {
        setCalendar(...sp.slice(0, 4), author, groupId, callback)
      } else {
        help(callback)
      }
      break
    case "insert-select":
      if(userHash[author] && userHash[author].search[content]) {
        await setCalendarByOid(userHash[author].search[content]._id, userHash[author].infos, callback)
        delete userHash[author]
      } else {
        help(callback)
      }
      break
    case "delete":
      if(userDelHash[author]) {
        delete userDelHash[author]
      }
      if(sp.length >= 2) {
        deleteCalendar(...sp.slice(0, 2), author, groupId, callback)
      } else {
        help(callback)
      }
      break
    case "delete-select":
      if(userDelHash[author] && userDelHash[author].search[content]) {
        await deleteCalendarByOid(userDelHash[author].search[content]._id, callback)
        delete userDelHash[author]
      } else {
        help(callback)
      }
      break
  }
}

const deleteCalendar = async (project, activity, groupId, author, callback) => {
  let search = await client.db('db_bot').collection('cl_calendar').find({ project, activity, groupId }).toArray()

  if(search.length) {
    if(search.length > 1) {
      userDelHash[author] = {
        search
      }
      callback(`选择需要删除的位置:\n${search.map((x, i) => `选择删除${i} | ${x.project}-${x.activity} ${formatTime(x.startTime)} ~ ${formatTime(x.endTime)}`).join('\n')}`)
    } else {
      await client.db('db_bot').collection('cl_calendar').remove(
        { '_id': search[0]._id }
      )
      callback('删除成功')
    }
  } else {
    callback('没有此条记录')
  }
}

const deleteCalendarByOid = async (_id, callback) => {
  await client.db('db_bot').collection('cl_calendar').remove({ _id })
  callback('删除成功')
}

const searchCalendar = async (project, groupId, callback) => {
  let data = await client.db('db_bot').collection('cl_calendar').find({ project, groupId }).toArray()
  if(data.length > 0) {
    callback(`${project}: \n${data.map(x => `${x.activity} ${formatTime(x.startTime)} ~ ${formatTime(x.endTime)}`).join('\n')}`)
  } else {
    callback(`${project}: 没有数据`)
  }
}

const setCalendar = async (project, activity, st, et, author, groupId, callback) => {
  if(project.length > 6) {
    callback('标题过长')
    return
  }
  let startTime = strToTs(st), endTime = strToTs(et)
  if(isNaN(startTime)) {
    callback('开始时间错误')
    return
  }
  if(isNaN(endTime)) {
    callback('结束时间错误')
    return
  }
  let search = await client.db('db_bot').collection('cl_calendar').find({ project, activity, groupId }).toArray()
  if(search.length) {
    if(search.length > 1) {
      userHash[author] = {
        search,
        infos: {
          project,
          activity,
          startTime,
          endTime,
          author,
          groupId
        }
      }
      callback(`选择需要设置的位置:\n${search.map((x, i) => `选择日历${i} | ${x.project}-${x.activity} ${formatTime(x.startTime)} ~ ${formatTime(x.endTime)}`).join('\n')}`)
      return
    }
  }

  await client.db('db_bot').collection('cl_calendar').save({
    project,
    activity,
    startTime,
    endTime,
    author,
    groupId
  })
  callback('设置成功')
}

const setCalendarByOid = async (_id, infos, callback) => {
  await client.db('db_bot').collection('cl_calendar').updateOne(
    { _id },
    {
      '$set': infos
    }
  )
  callback('设置成功')
}

const help = callback => {
  callback(`使用如下格式设置日历：\n\n日历设置\n【日历名称】\n【日历项目】\n【开始时间】\n【结束时间】\n\n*注：时间使用YYYY-MM-DD HH:MM:SS格式，不输入年份默认当年，不输入时间默认6点，各个参数之间使用换行分隔`)
}

const strToTs = str => {
  let s = str.trim()
  s = s.replace(/：/g, ':')
  if(s.split('-').length === 2) {
    s = `${new Date().getFullYear()}-${s}`
  }
  if(s.split(':').length === 1) {
    s = `${s} 6:0:0`
  }
  return new Date(s).getTime()
}

const formatTime = ts => `${new Date(ts).getFullYear()}-${new Date(ts).getMonth() + 1}-${new Date(ts).getDate()} ${new Date(ts).getHours()}:${addZero(new Date(ts).getMinutes())}:${addZero(new Date(ts).getSeconds())}`

const addZero = n => n < 10 ? ('0' + n) : n

module.exports = {
  calendar
}
