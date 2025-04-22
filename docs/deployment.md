# 部署指南

## 环境要求

- Node.js >= 16
- Python >= 3.8
- MySQL >= 8.0

## 前端部署

1. 安装依赖
```bash
cd frontend
npm install
```

2. 构建生产版本
```bash
npm run build
```

3. 部署到 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 后端部署

1. 创建虚拟环境
```bash
cd backend1
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

2. 安装依赖
```bash
pip install -r requirements/prod.txt
```

3. 配置环境变量
```bash
export DJANGO_SETTINGS_MODULE=config.settings.prod
export DATABASE_URL=mysql://user:password@localhost:3306/seal
export SECRET_KEY=your-secret-key
```

4. 数据库迁移
```bash
python manage.py migrate
```

5. 收集静态文件
```bash
python manage.py collectstatic
```

6. 使用 Gunicorn 运行（Linux/Mac）
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## 使用 Docker 部署

1. 构建镜像
```bash
docker-compose build
```

2. 启动服务
```bash
docker-compose up -d
```

## 监控和维护

1. 日志查看
```bash
# 前端日志
pm2 logs frontend

# 后端日志
tail -f /var/log/seal/app.log
```

2. 数据库备份
```bash
# 创建备份
mysqldump -u user -p seal > backup.sql

# 恢复备份
mysql -u user -p seal < backup.sql
```

3. 性能监控
- 使用 Prometheus 收集指标
- 使用 Grafana 展示监控面板
- 配置告警通知 