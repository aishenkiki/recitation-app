const express = require('express');
const { recognizeSpeech } = require('./xunfei-stt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// API 路由
app.post('/api/recognize', async (req, res) => {
    try {
        const { audio } = req.body;
        
        if (!audio) {
            return res.status(400).json({ error: '缺少音频数据' });
        }
        
        console.log('收到语音识别请求，音频数据长度:', audio.length);
        
        const result = await recognizeSpeech(audio);
        
        res.json({ 
            success: true, 
            text: result 
        });
        
    } catch (error) {
        console.error('识别错误:', error);
        res.status(500).json({ 
            error: error.message || '识别失败' 
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${PORT}`);
});