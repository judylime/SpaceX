//给node.JS用的语法
const { createProxyMiddleware } = require('http-proxy-middleware');/* 从库里拿到这个createProxyMiddleware function*/
module.exports = function(app) {
    /*因为n2yo提供的api 是以链接形式提供的，所以在这里对接口的参数进行一个解析*/
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://api.n2yo.com',//redirect
            changeOrigin: true,
        })
    );
};
