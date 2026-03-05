# ZmdDmg 项目文档

## 项目介绍

ZmdDmg 是一个明日方舟游戏数据查询和伤害计算工具，采用前后端分离架构。

## 技术栈

### 后端
- **语言**: Python
- **Web 框架**: Flask 3.0.0
- **CORS**: flask-cors 4.0.0
- **数据格式**: JSON

### 前端
- **语言**: JavaScript (ES6+)
- **框架**: React 18.3.1
- **构建工具**: Vite 5.4.1
- **代码规范**: ESLint
- **Node 版本**: >=18.0.0

## 目录结构

```
ZmdDmg/
├── backend/
│   ├── app.py                # Flask 后端主程序
│   ├── requirements.txt      # Python 依赖
│   ├── download_assets.py    # 资源下载脚本
│   ├── update_damage_types.py
│   ├── scrape_operators.py
│   ├── operators/            # 干员数据
│   │   ├── operators_index.json
│   │   ├── avatar/           # 干员头像
│   │   └── [干员名].json
│   ├── weapons/              # 武器数据
│   │   ├── weapons_index.json
│   │   ├── icon/             # 武器图标
│   │   └── [武器名].json
│   ├── equipment/            # 装备数据
│   │   ├── equipment_index.json
│   │   ├── icon/             # 装备图标
│   │   └── [装备名].json
│   └── multiplier/           # Buff 数据
│       ├── buff_index.json
│       ├── enemyBuff_index.json
│       └── enemyBuff.json
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── assets/
        └── components/
            ├── Sidebar.jsx/css
            ├── OperatorSection.jsx/css
            ├── WeaponSelectModal.jsx/css
            ├── EquipmentSelectModal.jsx/css
            ├── EquipmentEnemySection.jsx/css
            ├── DamageDisplay.jsx/css
            ├── StatsDisplay.jsx/css
            ├── Modal.jsx/css
            ├── ListSelectModal.jsx/css
            ├── IconSelectModal.jsx/css
            └── Toast.jsx/css
```

## 后端 API 文档

### 基础信息

- **默认端口**: 5000
- **默认地址**: `http://localhost:5000`
- **支持跨域**: 是 (Flask-CORS)

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/operators` | 获取所有干员列表 |
| GET | `/api/operator/<operator_id>` | 获取指定干员详情 |
| GET | `/api/weapons` | 获取所有武器列表 |
| GET | `/api/weapon/<weapon_id>` | 获取指定武器详情 |
| GET | `/api/equipment` | 获取所有装备列表 |
| GET | `/api/equipment/<equipment_id>` | 获取指定装备详情 |
| GET | `/api/buffs` | 获取 Buff 列表 |
| GET | `/api/enemy-buffs` | 获取敌人 Buff 列表（包含默认值） |
| POST | `/api/calculate-damage` | 计算伤害 |
| POST | `/api/log/weapon-buff` | 记录武器 Buff 日志 |
| GET | `/api/assets/operators/avatar/<filename>` | 获取干员头像资源 |
| GET | `/api/assets/weapons/icon/<filename>` | 获取武器图标资源 |
| GET | `/api/assets/equipment/icon/<filename>` | 获取装备图标资源 |

### 数据模型

#### 技能等级映射
| 等级 | 键值 |
|------|------|
| 1-9 | `1`-`9` |
| 10 | `M1` |
| 11 | `M2` |
| 12 | `M3` |

## 前端架构

### 核心组件

| 组件 | 功能 |
|------|------|
| `App.jsx` | 主应用组件，包含状态管理和核心逻辑 |
| `Sidebar` | 侧边栏导航 |
| `OperatorSection` | 干员选择区域 |
| `WeaponSelectModal` | 武器选择弹窗 |
| `EquipmentSelectModal` | 装备选择弹窗 |
| `EquipmentEnemySection` | 装备和敌人 Buff 区域 |
| `DamageDisplay` | 伤害数据展示 |
| `StatsDisplay` | 属性统计展示 |
| `Modal` | 通用弹窗组件 |
| `ListSelectModal` | 列表选择弹窗 |
| `IconSelectModal` | 图标选择弹窗 |
| `Toast` | 提示消息组件 |

### 核心功能

1. **干员选择**
   - 从列表中选择干员
   - 显示干员头像和基本信息

2. **武器选择**
   - 选择武器
   - 配置武器技能等级

3. **装备选择**
   - 选择装备（多件）
   - 配置装备精炼等级

4. **敌人 Buff 配置**
   - 配置敌人的各种减伤、抗性、脆弱等属性

5. **伤害计算**
   - 普通攻击伤害
   - 战技伤害
   - 连携技伤害
   - 终结技伤害

### 核心计算逻辑

`App.jsx` 中包含以下核心计算函数：

| 函数 | 功能 |
|------|------|
| `calculateDamage()` | 计算干员伤害数据 |
| `calculateEnemyStats()` | 计算敌人属性 |
| `getStatByLevel()` | 根据等级获取属性值 |
| `parseAttrBonuses()` | 解析装备属性加成 |
| `parseWeaponSkillBonuses()` | 解析武器技能加成 |
| `parseEquipmentToBuff()` | 将装备转换为 Buff |
| `parseWeaponSkillToBuff()` | 将武器技能转换为 Buff |
| `parseBuffBonuses()` | 解析 Buff 加成 |

## 启动方式

### 后端启动

```bash
cd ZmdDmg/backend
pip install -r requirements.txt
python app.py
```

后端将在 `http://localhost:5000` 启动。

### 前端启动

```bash
cd ZmdDmg/frontend
npm install
npm run dev
```

前端开发服务器将启动，默认地址通常为 `http://localhost:5173`。

### 构建前端

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 依赖

### Python 依赖 (requirements.txt)

```
Flask==3.0.0
flask-cors==4.0.0
```

### Node.js 依赖 (package.json)

**生产依赖:**
- react: ^18.3.1
- react-dom: ^18.3.1

**开发依赖:**
- vite: ^5.4.1
- @vitejs/plugin-react: ^4.3.1
- eslint: ^9.9.0
- @eslint/js: ^9.9.0
- eslint-plugin-react-hooks: ^5.1.0-rc.0
- eslint-plugin-react-refresh: ^0.4.9
- globals: ^15.9.0
- @types/react: ^18.3.3
- @types/react-dom: ^18.3.0

## 相关文档

- [项目总览](./项目总览.md)
- [MISC/ZmdData 数据文档](./MISC-ZmdData.md)
