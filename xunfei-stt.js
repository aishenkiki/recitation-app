const crypto = require('crypto');
const axios = require('axios');

// 讯飞配置
const XUNFEI_APPID = '01e97629';
const XUNFEI_API_SECRET = 'ZDIyMWUzYzJmNzNiYTZkMGU3YjdiOTcx';
const XUNFEI_API_KEY = '8d44daaf608fc37051c600fa709168b3';

// WebSocket 客户端
const WebSocket = require('ws');

// 生成鉴权URL
function getAuthUrl(host, path, apiKey, apiSecret) {
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signatureSha = crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest();
    const signature = signatureSha.toString('base64');
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');
    const url = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
    return url;
}

// 语音识别
async function recognizeSpeech(audioBase64, format = 'raw') {
    return new Promise((resolve, reject) => {
        const host = 'iat-api.xfyun.cn';
        const path = '/v2/iat';
        const url = getAuthUrl(host, path, XUNFEI_API_KEY, XUNFEI_API_SECRET);
        
        const ws = new WebSocket(url);
        let result = '';
        
        ws.on('open', () => {
            // 发送第一帧
            const frame = {
                common: {
                    app_id: XUNFEI_APPID
                },
                business: {
                    language: 'zh_cn',
                    domain: 'iat',
                    accent: 'mandarin',
                    vad_eos: 2000,
                    dwa: 'wpgs' // 动态修正
                },
                data: {
                    status: 2, // 最后一帧
                    format: format,
                    encoding: 'raw',
                    audio: audioBase64
                }
            };
            ws.send(JSON.stringify(frame));
        });
        
        ws.on('message', (data) => {
            const res = JSON.parse(data.toString());
            if (res.code !== 0) {
                reject(new Error(`讯飞API错误: ${res.code} - ${res.message}`));
                ws.close();
                return;
            }
            
            if (res.data && res.data.result) {
                const wsResult = res.data.result;
                if (wsResult.ws) {
                    wsResult.ws.forEach(item => {
                        if (item.cw) {
                            item.cw.forEach(cw => {
                                result += cw.w;
                            });
                        }
                    });
                }
            }
            
            if (res.data && res.data.status === 2) {
                ws.close();
            }
        });
        
        ws.on('close', () => {
            resolve(result);
        });
        
        ws.on('error', (err) => {
            reject(err);
        });
        
        // 超时
        setTimeout(() => {
            ws.close();
            resolve(result || '');
        }, 30000);
    });
}

module.exports = { recognizeSpeech, XUNFEI_APPID, XUNFEI_API_KEY, XUNFEI_API_SECRET };
