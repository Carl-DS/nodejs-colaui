/**
 * Created by Carl on 2017/3/19.
 */
var express = require('express');
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');

// url模块是Node.js标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

var router = express.Router();

router.get('/',function (req, res, next) {

    superagent.get(cnodeUrl).end(function (err, sres) {
        if (err) {
            return console.error(err);
        }
        var topicUrls = [];
        var $ = cheerio.load(sres.text);
        // 获取首页的所有链接
        $('#topic_list .topic_title').each(function (idx, element) {
            var $element = $(element);
            // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
            // 我们用 url.resolve 来自动推断出完整 url，变成
            // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
            // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
            var href = url.resolve(cnodeUrl, $element.attr('href'));
            topicUrls.push(href);
        });
        console.log(topicUrls);
        // 得到topicUrls 后
        // 得到一个eventproxy 实例
        var ep = new eventproxy();

        // 命令ep 重复监听topicUrls.length 次，（此处是40次）'topic_html'事件再行动
        ep.after('topic_html', topicUrls.length, function (topics) {
            // topics 是个数组，包含了40次ep.emit('topic_html', pair)中的那个40个pair

            //开始行动
            topics = topics.map(function (topicPair) {
                var topicUrl = topicPair[0];
                var topicHtml = topicPair[1];
                var $ = cheerio.load(topicHtml);
                return ({
                    title: $('.topic_full_title').text().trim(),
                    href: topicUrl,
                    comment1: $('.reply_content').eq(0).text().trim()
                });
            });

            console.log("final:");
            console.log(topics);
        });

        topicUrls.forEach(function (topicUrl) {
            superagent.get(topicUrl).end(function (err, sres) {
                console.log('fetch ' + topicUrl + " successful");
                ep.emit('topic_html', [topicUrl, sres.text]);
            });
        });
        res.send(topicUrls);
    });
});

module.exports = router;