# node-js-getting-started

一个简单的使用 Express 4 的 Node.js 应用。
可以运行在 LeanEngine Node.js 运行时环境。

## 本地运行

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境，然后执行下列指令：

然后在根目录下添加dev_conf.json文件

```
{
  "DEV_KEY":{
    "APP_ID" : "您应用的appid",
    "APP_KEY" : "您应用的appkey",
    "MASTER_KEY" :  "您应用的masterkey"
  }
} 

```

安装依赖：

```
npm install
```



启动项目：

```
$ node server.js

```

应用即可启动运行：[localhost:3000](http://localhost:3000)



## 相关文档

* [LeanEngine 指南](https://leancloud.cn/docs/leanengine_guide-node.html)
* [JavaScript 指南](https://leancloud.cn/docs/js_guide.html)

