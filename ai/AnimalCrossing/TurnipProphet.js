const { analyze_possibilities } = require('./core/predictions')
const render = require('./renderImage')
const { getUserDTCInfo } = require('./priceRecord')

const testJson = { "_id" : 357474405, "gid" : [ 205700800, 221698514, 102135023 ], "d" : { "18369" : { "p0" : 121, "p1" : 109 }, "18370" : { "p0" : 71, "p1" : 0 }, "18371" : { "p0" : 97, "p1" : 0 }, "18372" : { "p0" : 54, "p1" : 50 }, "18373" : { "p0" : 44, "p1" : 0 } }, "tz" : 16 }

const help = callback => {
  callback('这是帮助')
}

const formatSaveData = (data, type, callback) => {
  let d = data.d

  var tz = 16;
  var n = content.indexOf("utc");
  if(data) {
    if (n >= 0) {
      tz = 2 * parseInt(content.substring(n + 3));
      content = content.substring(0, n);
      if (tz > 24 || tz < -24) {
        tz = 16;
      }
    } else {
      tz = data.tz;
    }
  }else {
    if (n >= 0) {
      tz = 2 * parseInt(content.substring(n + 3));
      content = content.substring(0, n);
      if (tz > 24 || tz < -24) {
        tz = 16;
      }
    }
  }

  var now = new Date();
  var fixnow = new Date(now.getTime()+(tz-16)*1800000);
  var day = Math.floor(fixnow.getTime()/86400000);

  var pd = (day+4)%7;


  let ret = ''
  for(var i=pd;i>=0;i--){
    var thenprice = d[day-i]?(d[day-i].p0+"-"+d[day-i].p1):"0-0";
    ret = ret + "周"+(pd-i)+":"+thenprice+"\n";
  }

}

const findSaveData = (qq, type, callback) => {
  getUserDTCInfo(qq, data => {
    if(data && data.d) {

    }
  })
}

module.exports = function(content, qq, group, type, callback) {
  if(content.trim() == ''){
    help()
    return
  }
  let format = content.replace(/ +/g, ' ').trim().split(' ')
  let sp = format.slice(0, 7), inputArr = []
  for(let i = 0; i < sp.length; i++) {
    // console.log(i)
    if(sp[i] == 'x') {
      inputArr.push(NaN)
      inputArr.push(NaN)
      continue
    }
    if(i > 0 && /^(\d{1,3}|x)-(\d{1,3}|x)$/.test(sp[i])) {
      let s = sp[i].split('-')
      if(s[0] == 'x') {
        inputArr.push(NaN)
      } else {
        inputArr.push(parseInt(s[0]))
      }
      if(s[1] == 'x') {
        inputArr.push(NaN)
      } else {
        inputArr.push(parseInt(s[1]))
      }
      continue
    }
    if(/^\d{1,3}$/.test(sp[i])){
      if(i == 0) {
        inputArr.push(parseInt(sp[i]))
        inputArr.push(parseInt(sp[i]))
      } else {
        inputArr.push(parseInt(sp[i]))
        inputArr.push(NaN)
      }
      continue
    }
    callback('输入错误')
    return
  }
  let calc = analyze_possibilities(inputArr, false, -1)
  render(calc, callback)


}
