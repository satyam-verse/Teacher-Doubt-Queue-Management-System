# DoubtX AI — Production Cloud Deployment Guide

This guide describes how to deploy **DoubtX AI** to AWS using **EC2 (Ubuntu 24.04)**, **RDS (MySQL 8.0)**, and **S3**.

---

## 1. AWS RDS (MySQL) Setup
1. Open the **Amazon RDS Console** and select **Create database**.
2. Select **MySQL** (Version 8.0 or newer).
3. Under **Templates**, select **Free Tier** or **Production** (e.g. `db.t4g.micro` or `db.t3.medium`).
4. Set:
   - **DB instance identifier**: `doubtx-db`
   - **Master username**: `admin`
   - **Master password**: `<StrongPassword>`
   - **Initial database name**: `doubtDB`
5. Under **Connectivity**:
   - Attach to your default VPC.
   - Set **Public Access** to **No** (best practice) or **Yes** only for external access.
   - Configure VPC Security Group: Allow inbound traffic on port `3306` from your EC2 Security Group.
6. Note your RDS endpoint: `doubtx-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`.

---

## 2. AWS S3 Bucket Setup (Attachments)
1. Open the **Amazon S3 Console** and click **Create bucket**.
2. Bucket name: `doubtx-attachments-<account-id>`.
3. Uncheck **Block all public access** only if you plan to serve public images, OR keep private and use presigned URLs (recommended).
4. Under **Permissions > Cross-origin resource sharing (CORS)**, add:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 3. AWS EC2 Instance Setup
1. Launch an **Ubuntu 24.04 LTS** EC2 instance (`t3.small` or `t3.medium` recommended).
2. Configure Security Group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
3. SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```
4. Install system packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git curl
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 4. Deploying DoubtX AI Code on EC2

### 4.1 Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/satyam-verse/Teacher-Doubt-Queue-Management-System.git doubtx
sudo chown -R ubuntu:ubuntu /var/www/doubtx
cd /var/www/doubtx
```

### 4.2 Backend Environment & Virtualenv
```bash
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r backend/requirements.txt
```

Create production `.env`:
```bash
nano .env
```
Paste your production settings:
```ini
FLASK_ENV=production
SECRET_KEY=<generate-random-64-character-string>
JWT_SECRET_KEY=<generate-random-64-character-string>
DATABASE_URL=mysql+pymysql://admin:<Password>@doubtx-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:3306/doubtDB
GEMINI_API_KEY=<your-google-gemini-api-key>
AWS_REGION=us-east-1
AWS_S3_BUCKET=doubtx-attachments-<account-id>
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
PORT=5000
```

### 4.3 Build Frontend
```bash
cd /var/www/doubtx/frontend
npm install
npm run build
```
This generates the optimized static build in `/var/www/doubtx/frontend/dist`.

---

## 5. Systemd Gunicorn Service

Create `/etc/systemd/system/doubtx.service`:
```ini
[Unit]
Description=DoubtX AI Gunicorn Eventlet Service
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/doubtx
Environment="PATH=/var/www/doubtx/venv/bin"
ExecStart=/var/www/doubtx/venv/bin/gunicorn --worker-class eventlet -w 1 --bind 127.0.0.1:5000 backend.wsgi:app

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable doubtx
sudo systemctl start doubtx
sudo systemctl status doubtx
```

---

## 6. Nginx Reverse Proxy Configuration

Edit `/etc/nginx/sites-available/doubtx`:
```nginx
server {
    listen 80;
    server_name <your-domain-or-ec2-ip>;

    # Frontend Single Page Application
    location / {
        root /var/www/doubtx/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST APIs & Legacy Endpoints
    location ~ ^/(api|add) {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Socket.IO Connections
    location /socket.io {
        proxy_pass http://127.0.0.1:5000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site and reload:
```bash
sudo ln -s /etc/nginx/sites-available/doubtx /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. SSL with Let's Encrypt (Optional but Recommended)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <your-domain.com>
```
Certbot will automatically configure HTTPS redirect and certificate renewal.
