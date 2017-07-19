var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var util = require('util');
var URL = require('url');
var fs = require('fs');
app.use(express.static('./static'));

const {relogin} = require('./baibai');

app.listen(10086,function(){

});
app.get('/login',function(req,res){
  fs.unlink('qq-bot.cookie',function(){
    relogin();
    setTimeout(function(){
      res.setHeader('Cache-Control','no-store');
      var path = __dirname + '/static/code.png';
      console.log(path);
      res.sendFile(path);
    },3000);
  })
});


const {baiduSearch} = require('./ai/baidusearch');
app.get('/test',function(req,res){
  baiduSearch('id','123');
  res.send('ok');
});

