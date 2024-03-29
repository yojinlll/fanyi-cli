#!/usr/bin/env node
import * as https from 'https'
import * as querystring from 'querystring'
import md5 = require('md5');
import { appId, appSecret } from './private'


type ErrorMap = {
  [k:string]: string
}
const errorMaps:ErrorMap = {
  52003: '用户认证失败',
  52001: '签名错误',
  52004: '账户余额不足',
}

export const translate = (word: string) => {
  const salt = Math.random()
  const sign = md5(appId + word + salt + appSecret)
  let from, to

  if (/[a-zA-Z]/.test(word[0])) {
    // en - zh
    from = 'en'
    to = 'zh'
  } else {
    // zh - en
    from = 'zh'
    to = 'en'
  }

  const query: string = querystring.stringify({
    q: word,
    appid: appId,
    from, to, salt, sign
  })

  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let chunks: Buffer[] = []

    response.on('data', (chunk) => {
      chunks.push(chunk)
    });
    response.on('end', () => {
      const string = Buffer.concat(chunks).toString()
      type BaiduResult = {
        error_code?: string;
        error_msg?: string;
        from: string;
        to: string;
        trans_result: { src: string; dst: string; }[]
      }
      const object: BaiduResult = JSON.parse(string)

      // 错误处理后退出进程
      if (object.error_code) {
        console.log(errorMaps[object.error_code] || console.error(object.error_msg));
        process.exit(2)
      } else {
        object.trans_result.forEach(obj => {
          console.log(obj.dst)
        })
        process.exit(0)
      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
}