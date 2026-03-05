# 第 2 章：Flask Web 框架

## 前言

Flask 是一个轻量级的 Python Web 框架，适合快速开发 API 和 Web 应用。

## 2.1 安装 Flask

```bash
# 使用 pip 安装
pip install flask
pip install flask-cors

# 或者使用 requirements.txt
pip install -r requirements.txt
```

## 2.2 最简单的 Flask 应用

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

运行后访问：http://localhost:5000

## 2.3 路由（Routing）

### 基本路由

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return "首页"

@app.route('/about')
def about():
    return "关于页面"

@app.route('/user/<username>')
def user_profile(username):
    return f"用户: {username}"

@app.route('/post/<int:post_id>')
def show_post(post_id):
    return f"文章 ID: {post_id}"

if __name__ == '__main__':
    app.run(debug=True)
```

### HTTP 方法

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    return "GET 请求"

@app.route('/api/data', methods=['POST'])
def post_data():
    return "POST 请求"

@app.route('/api/data', methods=['GET', 'POST'])
def handle_data():
    if request.method == 'GET':
        return "GET 请求"
    else:
        return "POST 请求"
```

## 2.4 返回 JSON 数据

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/user')
def get_user():
    user = {
        "name": "张三",
        "age": 25,
        "email": "zhangsan@example.com"
    }
    return jsonify(user)

@app.route('/api/users')
def get_users():
    users = [
        {"name": "张三", "age": 25},
        {"name": "李四", "age": 30}
    ]
    return jsonify(users)
```

## 2.5 请求数据处理

### 获取 URL 参数

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/search')
def search():
    # URL: /search?q=flask&page=1
    keyword = request.args.get('q', '')  # 默认值为空字符串
    page = request.args.get('page', 1, type=int)
    return f"搜索: {keyword}, 页码: {page}"
```

### 获取 POST JSON 数据

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username and password:
        return jsonify({"success": True, "message": "登录成功"})
    else:
        return jsonify({"success": False, "message": "参数缺失"}), 400
```

### 获取表单数据

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form.get('name')
    email = request.form.get('email')
    return f"收到: {name}, {email}"
```

## 2.6 跨域支持（CORS）

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许所有来源的跨域请求

@app.route('/api/data')
def get_data():
    return jsonify({"data": "跨域请求成功"})
```

## 2.7 项目实战：分析 ZmdDmg/backend/app.py

让我们分析项目中的 Flask 应用：

```python
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# 数据目录
OPERATORS_DIR = os.path.join(os.path.dirname(__file__), 'operators')
WEAPONS_DIR = os.path.join(os.path.dirname(__file__), 'weapons')
EQUIPMENT_DIR = os.path.join(os.path.dirname(__file__), 'equipment')


# 获取所有干员列表
@app.route('/api/operators', methods=['GET'])
def get_operators():
    index_path = os.path.join(OPERATORS_DIR, 'operators_index.json')
    with open(index_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)


# 获取指定干员详情
@app.route('/api/operator/<operator_id>', methods=['GET'])
def get_operator_detail(operator_id):
    file_path = None
    for filename in os.listdir(OPERATORS_DIR):
        if filename.endswith('.json') and filename != 'operators_index.json':
            file_path_candidate = os.path.join(OPERATORS_DIR, filename)
            with open(file_path_candidate, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if data.get('id') == operator_id:
                    file_path = file_path_candidate
                    break
    
    if not file_path:
        return jsonify({'error': 'Operator not found'}), 404
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)


# 获取所有武器
@app.route('/api/weapons', methods=['GET'])
def get_weapons():
    index_path = os.path.join(WEAPONS_DIR, 'weapons_index.json')
    with open(index_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data)


# 计算伤害
@app.route('/api/calculate-damage', methods=['POST'])
def calculate_damage():
    try:
        data = request.json
        operator = data.get('operator')
        
        if not operator:
            return jsonify({'error': 'No operator selected'}), 400
        
        result = {
            'normal_attack': operator.get('normal_attack', {}),
            'skill': operator.get('skill', {}),
            'ultimate': operator.get('ultimate', {})
        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 静态资源服务
@app.route('/api/assets/operators/avatar/<filename>')
def get_operator_avatar(filename):
    return send_from_directory(os.path.join(OPERATORS_DIR, 'avatar'), filename)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

## 2.8 RESTful API 设计规范

| HTTP 方法 | 用途 | 示例 |
|-----------|------|------|
| GET | 获取资源 | `GET /api/users` |
| POST | 创建资源 | `POST /api/users` |
| PUT | 更新资源 | `PUT /api/users/1` |
| DELETE | 删除资源 | `DELETE /api/users/1` |

### 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求错误 |
| 404 | 未找到 |
| 500 | 服务器错误 |

## 2.9 Flask 项目结构建议

```
my_flask_app/
├── app.py              # 主程序
├── requirements.txt    # 依赖
├── .gitignore
├── config/             # 配置文件
├── models/             # 数据模型
├── routes/             # 路由
│   ├── __init__.py
│   ├── auth.py
│   └── api.py
├── static/             # 静态文件
│   ├── css/
│   ├── js/
│   └── images/
└── templates/          # 模板（如果使用）
    └── index.html
```

## 2.10 测试 API

### 使用 curl 测试

```bash
# GET 请求
curl http://localhost:5000/api/operators

# POST 请求
curl -X POST http://localhost:5000/api/calculate-damage \
  -H "Content-Type: application/json" \
  -d '{"operator": {"name": "test"}}'
```

### 使用 Python requests 测试

```python
import requests

# GET
response = requests.get('http://localhost:5000/api/operators')
print(response.json())

# POST
data = {"operator": {"name": "test"}}
response = requests.post('http://localhost:5000/api/calculate-damage', json=data)
print(response.json())
```

## 2.11 总结

Flask 的核心概念：
- **路由（Route）**：URL 到函数的映射
- **请求（Request）**：客户端发送的数据
- **响应（Response）**：服务器返回的数据
- **JSON**：API 常用数据格式

**下一章：** [JavaScript 基础](./03-JavaScript基础.md)
