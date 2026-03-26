const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3001;

// 配置静态文件服务
app.use(express.static(__dirname));
app.use(express.json());

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        // 确保uploads目录存在
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 确保uploads目录存在
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// 获取展会列表
app.get('/api/exhibitions', (req, res) => {
    const exhibitionsPath = path.join(__dirname, 'exhibitions.json');
    
    fs.readFile(exhibitionsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取展会数据失败:', err);
            res.status(500).json({ error: '读取展会数据失败' });
            return;
        }
        
        try {
            const exhibitions = JSON.parse(data);
            res.json(exhibitions);
        } catch (parseError) {
            console.error('解析展会数据失败:', parseError);
            res.status(500).json({ error: '解析展会数据失败' });
        }
    });
});

// 获取单个展会详情
app.get('/api/exhibitions/:id', (req, res) => {
    const exhibitionsPath = path.join(__dirname, 'exhibitions.json');
    const id = parseInt(req.params.id);
    
    fs.readFile(exhibitionsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取展会数据失败:', err);
            res.status(500).json({ error: '读取展会数据失败' });
            return;
        }
        
        try {
            const exhibitions = JSON.parse(data);
            const exhibition = exhibitions.find(ex => ex.id === id);
            
            if (!exhibition) {
                res.status(404).json({ error: '展会不存在' });
                return;
            }
            
            res.json(exhibition);
        } catch (parseError) {
            console.error('解析展会数据失败:', parseError);
            res.status(500).json({ error: '解析展会数据失败' });
        }
    });
});

// 添加展会
app.post('/api/exhibitions', upload.array('images', 10), (req, res) => {
    const exhibitionsPath = path.join(__dirname, 'exhibitions.json');
    
    fs.readFile(exhibitionsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取展会数据失败:', err);
            res.status(500).json({ error: '读取展会数据失败' });
            return;
        }
        
        try {
            const exhibitions = JSON.parse(data);
            
            const newId = exhibitions.length > 0 ? Math.max(...exhibitions.map(ex => ex.id)) + 1 : 1;
            
            const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
            
            const newExhibition = {
                id: newId,
                name: req.body.name,
                date: req.body.date,
                location: req.body.location,
                description: req.body.description,
                images: imagePaths
            };
            
            exhibitions.push(newExhibition);
            
            fs.writeFile(exhibitionsPath, JSON.stringify(exhibitions, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('写入展会数据失败:', writeErr);
                    res.status(500).json({ error: '写入展会数据失败' });
                    return;
                }
                
                res.json(newExhibition);
            });
        } catch (parseError) {
            console.error('解析展会数据失败:', parseError);
            res.status(500).json({ error: '解析展会数据失败' });
        }
    });
});

// 更新展会
app.put('/api/exhibitions/:id', upload.array('images', 10), (req, res) => {
    const exhibitionsPath = path.join(__dirname, 'exhibitions.json');
    const id = parseInt(req.params.id);
    
    fs.readFile(exhibitionsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取展会数据失败:', err);
            res.status(500).json({ error: '读取展会数据失败' });
            return;
        }
        
        try {
            const exhibitions = JSON.parse(data);
            const index = exhibitions.findIndex(ex => ex.id === id);
            
            if (index === -1) {
                res.status(404).json({ error: '展会不存在' });
                return;
            }
            
            const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
            
            exhibitions[index] = {
                id: id,
                name: req.body.name,
                date: req.body.date,
                location: req.body.location,
                description: req.body.description,
                images: imagePaths
            };
            
            fs.writeFile(exhibitionsPath, JSON.stringify(exhibitions, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('写入展会数据失败:', writeErr);
                    res.status(500).json({ error: '写入展会数据失败' });
                    return;
                }
                
                res.json(exhibitions[index]);
            });
        } catch (parseError) {
            console.error('解析展会数据失败:', parseError);
            res.status(500).json({ error: '解析展会数据失败' });
        }
    });
});

// 删除展会
app.delete('/api/exhibitions/:id', (req, res) => {
    const exhibitionsPath = path.join(__dirname, 'exhibitions.json');
    const id = parseInt(req.params.id);
    
    fs.readFile(exhibitionsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取展会数据失败:', err);
            res.status(500).json({ error: '读取展会数据失败' });
            return;
        }
        
        try {
            const exhibitions = JSON.parse(data);
            const updatedExhibitions = exhibitions.filter(ex => ex.id !== id);
            
            fs.writeFile(exhibitionsPath, JSON.stringify(updatedExhibitions, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('写入展会数据失败:', writeErr);
                    res.status(500).json({ error: '写入展会数据失败' });
                    return;
                }
                
                res.json({ message: '展会删除成功' });
            });
        } catch (parseError) {
            console.error('解析展会数据失败:', parseError);
            res.status(500).json({ error: '解析展会数据失败' });
        }
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log(`展会展示页面: http://localhost:${port}/exhibition.html`);
    console.log(`后台管理页面: http://localhost:${port}/admin.html`);
});