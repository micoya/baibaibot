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
const {QQ} = require('./qqlib');
app.get('/login',function(req,res){
  relogin();
  res.redirect('/code.png');
});

