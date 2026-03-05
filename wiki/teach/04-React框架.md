# 第 4 章：React 框架

## 前言

React 是目前最流行的前端框架之一，用于构建用户界面。对于 C++/UE 程序员，可以把 React 组件想象成 UE 的 Actor 或 Widget。

## 4.1 环境准备

### 安装 Node.js

```bash
# Mac 使用 Homebrew
brew install node

# 验证安装
node --version
npm --version
```

### 创建 React 项目

```bash
# 使用 Vite 创建（推荐，更快）
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev

# 或者使用 create-react-app
npx create-react-app my-react-app
cd my-react-app
npm start
```

## 4.2 React 基础概念

### 组件（Component）

组件是 React 的基本构建块，类似 UE 的 Actor。

```jsx
// 函数组件（推荐）
function Welcome({ name }) {
    return <h1>Hello, {name}!</h1>;
}

// 使用组件
function App() {
    return (
        <div>
            <Welcome name="张三" />
            <Welcome name="李四" />
        </div>
    );
}
```

### JSX 语法

JSX 是 JavaScript 的语法扩展，类似 C++ 的宏或 UE 的 UMG 蓝图。

```jsx
// JSX 会被编译成 JavaScript
const element = <h1>Hello, world!</h1>;

// 等价于：
const element = React.createElement(
    'h1',
    null,
    'Hello, world!'
);

// 在 JSX 中使用表达式
const name = "张三";
const element = <h1>Hello, {name}!</h1>;

// 条件渲染
const isLoggedIn = true;
const element = (
    <div>
        {isLoggedIn ? <UserPanel /> : <LoginPanel />}
    </div>
);

// 列表渲染
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map(num => <li key={num}>{num}</li>);
```

## 4.3 Props（属性）

Props 是父组件传递给子组件的数据，类似 C++ 的函数参数或 UE 的变量。

```jsx
// 子组件接收 props
function Greeting({ name, age }) {
    return (
        <div>
            <p>姓名: {name}</p>
            <p>年龄: {age}</p>
        </div>
    );
}

// 父组件传递 props
function App() {
    return <Greeting name="张三" age={25} />;
}

// 默认 props
function Button({ text = "点击", onClick }) {
    return <button onClick={onClick}>{text}</button>;
}
```

## 4.4 State（状态）

State 是组件内部的状态，类似 C++ 的成员变量或 UE 的属性。

```jsx
import { useState } from 'react';

function Counter() {
    // useState 返回 [当前值, 更新函数]
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>计数: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                增加
            </button>
            <button onClick={() => setCount(count - 1)}>
                减少
            </button>
        </div>
    );
}
```

### 复杂状态

```jsx
import { useState } from 'react';

function UserForm() {
    const [user, setUser] = useState({
        name: '',
        age: 0
    });

    const handleNameChange = (e) => {
        setUser({
            ...user,  // 展开操作符，保留其他属性
            name: e.target.value
        });
    };

    const handleAgeChange = (e) => {
        setUser({
            ...user,
            age: parseInt(e.target.value)
        });
    };

    return (
        <div>
            <input
                type="text"
                value={user.name}
                onChange={handleNameChange}
                placeholder="姓名"
            />
            <input
                type="number"
                value={user.age}
                onChange={handleAgeChange}
                placeholder="年龄"
            />
        </div>
    );
}
```

## 4.5 useEffect（副作用）

useEffect 用于处理副作用（如数据获取、订阅等），类似 UE 的 BeginPlay 或 Tick。

```jsx
import { useState, useEffect } from 'react';

function DataFetcher() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 组件挂载时执行（类似 BeginPlay）
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/data');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);  // 空依赖数组：只在挂载时执行一次

    if (loading) {
        return <div>加载中...</div>;
    }

    return <div>{JSON.stringify(data)}</div>;
}
```

### 依赖数组

```jsx
import { useState, useEffect } from 'react';

function Search({ keyword }) {
    const [results, setResults] = useState([]);

    // keyword 变化时重新执行
    useEffect(() => {
        if (keyword) {
            fetch(`/api/search?q=${keyword}`)
                .then(res => res.json())
                .then(data => setResults(data));
        }
    }, [keyword]);  // 依赖 keyword

    return (
        <div>
            {results.map(item => (
                <div key={item.id}>{item.title}</div>
            ))}
        </div>
    );
}
```

### 清理函数

```jsx
import { useEffect } from 'react';

function Timer() {
    useEffect(() => {
        const timer = setInterval(() => {
            console.log('Tick');
        }, 1000);

        // 清理函数（组件卸载时执行，类似 EndPlay）
        return () => {
            clearInterval(timer);
        };
    }, []);

    return <div>定时器</div>;
}
```

## 4.6 项目实战：分析 ZmdDmg 前端

让我们看一下项目中的 React 组件：

### App.jsx（简化版）

```jsx
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import OperatorSection from './components/OperatorSection';
import DamageDisplay from './components/DamageDisplay';

function App() {
    const [operators, setOperators] = useState([]);
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [skillLevels, setSkillLevels] = useState({
        normal: 9,
        skill: 9,
        combo: 9,
        ultimate: 9
    });

    // 获取干员列表
    useEffect(() => {
        fetch('http://localhost:5000/api/operators')
            .then(res => res.json())
            .then(data => setOperators(data.operators))
            .catch(err => console.error(err));
    }, []);

    // 计算伤害
    const calculateDamage = (operator, skillLevels) => {
        if (!operator) return null;

        return {
            normal_attack: {
                ...operator.normal_attack,
                levelKey: getLevelKey(skillLevels.normal)
            },
            skill: {
                ...operator.skill,
                levelKey: getLevelKey(skillLevels.skill)
            },
            combo_skill: {
                ...operator.combo_skill,
                levelKey: getLevelKey(skillLevels.combo)
            },
            ultimate: {
                ...operator.ultimate,
                levelKey: getLevelKey(skillLevels.ultimate)
            }
        };
    };

    const damageResult = calculateDamage(selectedOperator, skillLevels);

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <OperatorSection
                    operators={operators}
                    selectedOperator={selectedOperator}
                    onSelectOperator={setSelectedOperator}
                    skillLevels={skillLevels}
                    onSkillLevelChange={setSkillLevels}
                />
                {damageResult && (
                    <DamageDisplay result={damageResult} />
                )}
            </main>
        </div>
    );
}

function getLevelKey(level) {
    if (level === 10) return 'M1';
    if (level === 11) return 'M2';
    if (level === 12) return 'M3';
    return String(level);
}

export default App;
```

### 组件示例：OperatorSection.jsx

```jsx
function OperatorSection({ operators, selectedOperator, onSelectOperator, skillLevels, onSkillLevelChange }) {
    return (
        <div className="operator-section">
            <h2>选择干员</h2>
            <div className="operator-list">
                {operators.map(op => (
                    <div
                        key={op.id}
                        className={`operator-card ${selectedOperator?.id === op.id ? 'selected' : ''}`}
                        onClick={() => onSelectOperator(op)}
                    >
                        <img src={op.avatar_url} alt={op.name} />
                        <span>{op.name}</span>
                    </div>
                ))}
            </div>

            {selectedOperator && (
                <div className="skill-levels">
                    <h3>技能等级</h3>
                    <div className="level-inputs">
                        <div>
                            <label>普通攻击</label>
                            <input
                                type="number"
                                value={skillLevels.normal}
                                onChange={(e) => onSkillLevelChange({
                                    ...skillLevels,
                                    normal: parseInt(e.target.value)
                                })}
                                min="1"
                                max="12"
                            />
                        </div>
                        {/* 更多技能等级输入... */}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OperatorSection;
```

## 4.7 React Hooks 总结

| Hook | 用途 |
|------|------|
| `useState` | 管理组件状态 |
| `useEffect` | 处理副作用 |
| `useContext` | 访问 Context |
| `useReducer` | 复杂状态管理 |
| `useCallback` | 缓存函数 |
| `useMemo` | 缓存计算结果 |
| `useRef` | 引用 DOM 或值 |

## 4.8 项目结构

```
my-react-app/
├── public/
│   └── index.html
├── src/
│   ├── components/       # 组件
│   │   ├── Sidebar.jsx
│   │   ├── Sidebar.css
│   │   ├── OperatorSection.jsx
│   │   └── OperatorSection.css
│   ├── App.jsx           # 主组件
│   ├── App.css
│   ├── main.jsx          # 入口文件
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

## 4.9 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 4.10 总结

React 的核心概念：
- **组件（Component）**：UI 的基本构建块
- **Props**：父组件传递给子组件的数据
- **State**：组件内部的状态
- **Hooks**：函数组件中使用状态和其他功能

**下一章：** [前端基础](./05-前端基础.md)
