// 加载依赖库, Express3 中这个类库都封装在connect 中, 现在需要单独地加载
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 加载路由控制
var index = require('./routes/index');
var users = require('./routes/users');
var crawler = require('./routes/crawler');
var eventproxy = require('./routes/eventproxy');
var async = require('./routes/async');
var promise = require('./routes/promise');
var singleton = require('./routes/singleton');


// 创建项目实例
var app = express();

// view engine setup 定义jade模板引擎和模板文件位置,也可以使用ejs或其他模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public 定义icon图标
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// 定义日志和输出级别
app.use(logger('dev'));
// 定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 定义cookie解析器
app.use(cookieParser());
// 定义静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 匹配路径和路由
app.use('/', index);
app.use('/users', users);
app.use('/crawler', crawler);
app.use('/eventproxy', eventproxy);
app.use('/async', async);
app.use('/promise', promise);
app.use('/singleton', singleton);

// catch 404 and forward to error handler 404错误处理
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler 开发环境, 500错误处理和错误堆栈跟踪
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 输出模型app
module.exports = app;
