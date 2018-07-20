var https = require('https');
var crypto = require('crypto');
var appid = 1107054322;
var appkey = 'Yw6WKnq3It2cnUqn';

function getdescrpt(imgurl){
  imgurl = "https://gchat.qpic.cn/gchatpic_new/357474405/2195700800-2360270818-5C8891933DDD8D7502846A17F19E7B9B/0";
  var now = new Date();
  var tss = Math.floor(now.getTime()/1000) ;
  var nonce = 987654654;
  var session_id = 123456789
  var body = {
    app_id:appid,
    image:imgurl,
    nonce_str:nonce,
    time_stamp:tss,
    session_id:session_id
  }
  body['sign']=sign(body);
  console.log(body);


  var options = {
    host: 'api.ai.qq.com',
    port: 443,
    path: '/fcgi-bin/vision/vision_imgtotext',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log(options);
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var resdata = '';
    res.on('data', function (chunk) {
      resdata = resdata + chunk;
    });
    res.on('end', function () {
      var data = eval('('+resdata+')');
      console.log(resdata);
    });
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.write(JSON.stringify(body));
  req.end();
}

function sign(data){
  var keys = Object.keys(data);
  var str = "";
  keys.sort();
  for(var i=0;i<keys.length;i++){
    str = str + keys[i] + "=" + data[keys[i]] + "&";
  }
  str = str + "app_key="+appkey;
  console.log(str);
  var md5=crypto.createHash("md5");
  md5.update(str);
  var md5str=md5.digest('hex').toUpperCase();
  return md5str;
}


module.exports={
  getdescrpt
}