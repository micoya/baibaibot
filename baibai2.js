var http=require('http');
var https=require('https');
var tls = require('tls');
let onlineObj = {}
const { DQCore, allGameAction } = require('./ai/DQ/DQgameCore')

//const { QQ, MsgHandler } = require('./qqlib');

const{saveTxt,answer} = require('./lib/mongo');
const xchange = require('./ai/xchange')
const {cal} = require('./ai/calculator');
const {baiduSearch,baikeReply} = require('./ai/baidusearch');
const {weatherReply,getWeatherByCity} = require('./ai/weather');
const {tulingMsg} = require('./ai/tuling');
const {translateMsg}=require('./ai/translate');
const {money} = require('./ai/money');
const {getloc,route} = require('./ai/map');
const {searchSongByName} = require('./ai/song');
const kce = require('./ai/kanColleEquip')
const kcq = require('./ai/kanColleQuest')
const {getMapData} = require('./ai/kancolle/kancollemap')
const {searchsenka} = require('./ai/kancolle/senka');
const {fight,useMagicOrItem,regenTimer} = require('./ai/favour/battle');

const {actionGroup,actionBuddy} = require('./ai/ouat/ouatMain');

const {handleUserOperation,mazeRegenTimer} = require('./ai/chess/road');
const {banuser} = require('./ai/banuser');
const {pairReply}=require('./ai/pairAI');
const {getKancollStaffTweet,stream,streaminit} = require('./ai/twitter');
const {getShipReply}=require('./ai/kancolle/getship');
const roulette = require('./ai/Roulette')

const {kancolleInfo} = require('./ai/kancolle/shipData');
const {updateShipDB,updateItemDB,updateSuffixDB,loadShip,loadItem,loadSuffix,searchShipByName}=require('./ai/kancolle/shipData');
const {pushTask,pushToGroup} = require('./ai/push');
const {replayReply} = require('./ai/replay');


const {lottoryReply,getlottory} = require('./ai/lottory');
loadShip();
loadItem();
updateShipDB();
updateItemDB();
loadSuffix();
pushTask();



function handleMsg(msgObj,res){
  try{
    handleMsg_D(msgObj,res);
  }catch(e){
    console.log(e);
  }
}




function handleMsg_D(msgObj,response){
  var type = msgObj.message_type;
  var groupid = msgObj.group_id;
  if(type=='discu'){
    groupid = msg.discuId;
  }
  var from = msgObj.user_id;
  var content = msgObj.message;
  var name = "username-bycache";
  var groupName = "groupname-bycache";
  var callback = function(res,blank){
    if(res.trim().length>0){
      setTimeout(function(){
        if(!blank){
          res = " "+res
        }
        var ret = {at_sender:false,reply:res};
        console.log(ret);
        response.send(JSON.stringify(ret));
      },1000);
    }
  }

  if(true){
    callback('12345:\n66\t77\t88\n'+content);
    return;
  }

  let memberListInGroup = qqq.getMemberListInGroup(groupid);
  let nickname = "";
  for(let i = 0; i < memberListInGroup.length; i++){
    if(from === memberListInGroup[i].uin) {
      nickname = memberListInGroup[i].nick;
      break
    }
  }
  /*
  if(content.substring(0,2)=='自杀'){
    var minutes = content.substring(2);
    if(minutes==""){
      qqq.shutupGroupMember(groupid,from,Math.floor(Math.random()*600));
    }else if(minutes>=1&&minutes<10){
      qqq.shutupGroupMember(groupid,from,minutes*60);
    }
    return;
  }
  */

  /* game system */
  if(content === '开始游戏'){
    onlineObj[nickname] = 1
    console.log(`【${nickname}】已登入`)
    callback(`【${nickname}】已登入`)
  } else {
    if(onlineObj[nickname]){
      if(onlineObj[nickname] < 4){
        if(allGameAction[content.trim().split(' ')[0]]){
          onlineObj[nickname] = 1
          DQCore(nickname, content, callback)
        } else {
          onlineObj[nickname] ++
        }
        callback(`【${nickname}】${onlineObj[nickname]}`)
      } else {
        delete onlineObj[nickname]
        console.log(`【${nickname}】已登出`)
        callback(`【${nickname}】已登出`)
      }
    }
  }

  var rcontent=content.trim();
  if(
    rcontent === '俄罗斯轮盘' ||
    rcontent === '俄羅斯輪盤' ||
    rcontent === '加入' ||
    rcontent === '加入' ||
    rcontent === 'join' ||
    rcontent === '參加' ||
    rcontent === '参加' ||
    rcontent === '开枪' ||
    rcontent === '开火' ||
    rcontent === 'fire' ||
    rcontent === '開火' ||
    rcontent === '開槍'
  ){
    roulette(name,rcontent,callback)
    return
  }

  var first = content.substring(0,1);
  if(first=='o'||first=='O'){
    actionGroup(content.substring(1),from,groupid,qqq.getMemberListInGroup(groupid),qq);
    return;
  }
  if(first=="*"||first=='×'){
    lottoryReply(content.substring(1),name,callback);
  }


  if(first=='`'||first=='·'||first=='ˋ'||first=="'"||first=="‘"||first=="，"){

    var c1 = content.substring(1);
    if(c1==""){
      var ret = "`1+名词：百科查询\n翻译成中文：`6+要翻译的内容\n翻译成日文：`2+要翻译的内容\n翻译成英文：`3+要翻译的内容\n";
      ret = ret + "`4+内容：百度查询\n`c汇率转换\n`0+数字：大写数字转换\n`8+地点A-地点B：公交查询\n";
      ret = ret + '`r+数字：ROLL一个小于该数字的随机整数\n`g砍人\n`m迷宫\n';
      ret = ret + "天气预报：城市名+天气\n教百百说话：问题|答案\n计算器：直接输入算式\n闲聊：``+对话";
      callback(ret);
    }else{
      reply(c1,name,callback,groupid,from,groupName,nickname);
    }
    return;
  }
  if(rcontent=='天气'){
    if(msg.user){
      var city = msg.user.city;
      if(city.length>0&&city.length<5){
        getWeatherByCity(city,name,callback);
      }
    }
    return;
  }

  var n = content.indexOf('天气');
  if(n>1&&n<10&&rcontent.length==n+2){
    var city = content.substring(0,n).trim();
    try{
      getWeatherByCity(city,name,callback);
    }catch(e){
      console.log(e);
    }
    return;

  }
  var ca = content.split('|');
  if(ca.length==2){
    if(ca[0].length<50 && ca[0].split(' ').length < 2){
      saveTxt(ca[0],ca[1],name,groupName,callback);
      return;
    }
  }

  var calret = cal(content);
  if(calret){
    callback(content+"="+calret);
    return;
  }
  if(content.indexOf('百百')>-1){
    tulingMsg(name,content,callback);
    return;
  }
  answer(content,name,groupName,callback);
  if(nickname.indexOf('百百')==-1){
    replayReply(content,name,groupid,callback);
  }

}

function reply(content,userName,callback,groupid,from,groupName,nickname){
  var first = content.substring(0,1);
  if(first=='`'||first=='·'||first=='ˋ'||first=="'"||first=="‘"||first=="，"){
    tulingMsg(userName,content.substring(1),callback,groupid);
  }else if(first==2){
    translateMsg(content.substring(1),'ja',callback);
  }else if(first==3){
    translateMsg(content.substring(1),'en',callback);
  }else if(first==1){
    baikeReply(content.substring(1),userName,callback);
  }else if(first==4){
    baiduSearch(userName,content.substring(1),callback);
  }else if(first==0){
    callback(money(content.substring(1)));
  }else if(first=='b'||first=='B'){
    banuser(content.substring(1),userName,callback);
  }else if(first=='c'||first=='C'){
    xchange(userName,content.substring(1),callback);
  }else if(first=='d'||first=='D'){
    pairReply(content.substring(1),userName,callback);
  }else if(first=='t'||first=='T'){
    getKancollStaffTweet(content.substring(1),userName,callback);
  }else if(first=="e"||first=='E'){
    kce(userName,content.substring(1),callback);
  }else if(first=="l"||first=='L'){
    getShipReply(content.substring(1),userName,callback);
  }else if(first=="q"||first=='Q'){
    kcq(userName,content.substring(1),callback);
  }else if(first=="k"||first=='K'){
    kancolleInfo(content.substring(1),userName,callback);
  }else if(first=="z"||first=='Z'){
    searchsenka(userName,content.substring(1),callback);
  }else if(first=='s'||first=='S'){
    searchSongByName(userName,content.substring(1),callback);
  }else if(first=='r'||first=='R'){
    callback(""+Math.floor(Math.random()*parseInt(content.substring(1))));
  }else if(first=='f'||first=='F'){
      if(groupName.indexOf('咸鱼')>0||groupName.indexOf('百游戏')>0||(new Date().getHours()<=7&&new Date().getHours()>=0)){
        fight(from,content.substring(1),qqq.getMemberListInGroup(groupid),callback);
      }else{
        callback('为防止刷屏，当前关闭游戏功能');
      }
  }else if(first=='g'||first=='G'){
      if(groupName.indexOf('咸鱼')>0||groupName.indexOf('百游戏')>0||(new Date().getHours()<=7&&new Date().getHours()>=0)){
        useMagicOrItem(from,content.substring(1),qqq.getMemberListInGroup(groupid),callback);
      }else{
        callback('为防止刷屏，当前关闭游戏功能');
      }
  }else if(first=='m'||first=='M'){
    handleUserOperation(from,content.substring(1),qqq.getMemberListInGroup(groupid),callback);
  }else if(first==8){
    var ca = content.substring(1).split('-');
    if(ca.length==2){
      route(0,ca[0],ca[1],callback);
    }
  }else if(first=='6'){
    translateMsg(content.substring(1),'zh-CHS',callback)
  }else{
    translateMsg(content,'zh-CHS',callback)
  }
}

const replyBySwitch = (content, userName, callback) => {
  switch(content.substring(0, 1)){
    case '`':
    case '·':
    case 'ˋ':
    case "'":
    case "‘":
    case "，":
      tulingMsg(userName,content.substring(1),callback);
      break;
    case 0:
      callback(money(content.substring(1)));
      break;
    case 1:
      baikeReply(content.substring(1),userName,callback);
      break;
    case 2:
      translateMsg(content.substring(1),'ja',callback);
      break;
    case 3:
      translateMsg(content.substring(1),'en',callback);
      break;
    case 4:
      baiduSearch(userName,content,callback);
      break;
    case 8:
      if(content.substring(1).split('-') == 2)
        route(0,ca[0],ca[1],callback);
      break;
    default:
      translateMsg(content,'zh-CHS',callback);
  }
}











var relogin = function(){
  if(qqq){
    qqq.destroy();
  }
  qqq=new QQ(buddyHandler, groupHandler,discuHandler);
  qqq.run();
  setTimeout(function(){
    streamgroup();
  },30000);
}

var getGroupList = function(){
    return qqq.group;
}

var getQQQ = function(){
  return qqq;
}

module.exports={
  relogin,
  getQQQ,
  getGroupList,
  handleMsg
}


