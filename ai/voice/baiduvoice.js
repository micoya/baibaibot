var http = require('http');
var fs=require('fs');
var request = require("request");
const WxVoice = require('wx-voice');
var voice = new WxVoice();

var access_token="24.fd084f48038002b057b4b483e50d2ed0.2592000.1527919824.282335-11186658"
function initToken(){
  var options = {
    host: 'openapi.baidu.com',
    port: 443,
    path: '/oauth/2.0/token?grant_type=client_credentials&client_id=0zo4P6sBYoLDo2oHaqt6j68m&client_secret=7c5cd27097a52024739a3616438f0740',
    method: 'GET',
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var resdata = '';
    res.on('data', function (chunk) {
      resdata = resdata + chunk;
    });
    res.on('end', function () {
      var data = eval('('+resdata+')');
      access_token=data.access_token
    });
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.end();
}

function baiduVoice(text,callback){
  if(text.endsWith("。")){
    text=text.substring(0,text.length-2);
  }
  if(Math.random()<0.4){
    text=text+"喵";
  }

  var path = '/text2audio?lan=zh&ctp=1&cuid=abcdxxx&tok='+access_token+'&vol=6&per=5&spd=5&pit=7&tex='+encodeURIComponent(text);
  var optionreq = {
    url: 'https://tsn.baidu.com'+path,
    headers: {

    }
  }
  var now = new Date();
  var filename = 'static/'+now.getTime()+".mp3";
  var req = request.post(optionreq).pipe(fs.createWriteStream(filename));
  req.on('close',function(){
    console.log('finish voice:'+filename)
    voice.encode(
      filename, "../coolq-data/cq/data/record/send/"+now.getTime()+".silk", { format: "silk" },
      function(file){
        console.log(file);
        callback('[CQ:record,file=send/'+now.getTime()+'.silk]')
      })
  })
  req.on('error',function(err){
    console.log(err);
    callback("");
  })
}

module.exports={
  baiduVoice
}