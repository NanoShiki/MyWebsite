# 第 3 章：JavaScript 基础（从 C++ 视角）

## 前言

JavaScript 是前端开发的核心语言，也是 Node.js 后端的语言。对于 C++ 程序员来说，JS 有很多相似之处，但也有重要区别。

## 3.1 基本语法

### 变量声明

| C++ | JavaScript |
|-----|-----------|
| `int x = 10;` | `let x = 10;` (块级作用域) |
| `const float PI = 3.14;` | `const PI = 3.14;` (常量) |
| `var` (旧版) | `var` (函数作用域，不推荐) |

```javascript
// let - 块级作用域，可修改
let count = 0;
count = 1;

// const - 常量，不可修改
const PI = 3.14159;

// var - 函数作用域（尽量不用）
var oldStyle = "deprecated";
```

### 数据类型

```javascript
// 数字（不分整数和浮点数）
let age = 25;
let price = 19.99;

// 字符串
let name = "张三";
let greeting = '你好';
let multiline = `多行
字符串`;

// 布尔值
let isActive = true;
let isDone = false;

// 数组（类似 C++ 的 std::vector）
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "hello", true];

// 对象（类似 C++ 的 std::map，或结构体）
let person = {
    name: "张三",
    age: 25,
    city: "北京"
};

// null 和 undefined
let empty = null;      // 空值
let notDefined;         // 未定义

// typeof 检查类型
console.log(typeof 42);          // "number"
console.log(typeof "hello");      // "string"
console.log(typeof true);         // "boolean"
console.log(typeof {});           // "object"
console.log(typeof []);           // "object" (注意！)
console.log(typeof undefined);    // "undefined"
```

### 字符串操作

```javascript
let s = "Hello, World!";

// 长度
console.log(s.length);  // 13

// 拼接
let s2 = "Hello" + " " + "World";
let s3 = `${s2}!`;  // 模板字符串

// 常用方法
console.log(s.toUpperCase());  // "HELLO, WORLD!"
console.log(s.toLowerCase());  // "hello, world!"
console.log(s.includes("World"));  // true
console.log(s.indexOf("World"));    // 7
console.log(s.substring(0, 5));     // "Hello"
console.log(s.split(", "));          // ["Hello", "World!"]
```

## 3.2 数组操作

```javascript
let arr = [1, 2, 3, 4, 5];

// 访问元素
console.log(arr[0]);  // 1

// 添加元素
arr.push(6);           // 末尾添加：[1,2,3,4,5,6]
arr.unshift(0);        // 开头添加：[0,1,2,3,4,5,6]

// 删除元素
arr.pop();             // 删除末尾：[0,1,2,3,4,5]
arr.shift();           // 删除开头：[1,2,3,4,5]

// 切片
console.log(arr.slice(1, 3));  // [2, 3]

// 遍历
for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}

// for...of
for (let item of arr) {
    console.log(item);
}

// forEach
arr.forEach((item, index) => {
    console.log(`${index}: ${item}`);
});

// map - 转换每个元素
let doubled = arr.map(x => x * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// filter - 过滤
let evens = arr.filter(x => x % 2 === 0);
console.log(evens);  // [2, 4]

// reduce - 累加
let sum = arr.reduce((acc, x) => acc + x, 0);
console.log(sum);  // 15
```

## 3.3 对象操作

```javascript
let person = {
    name: "张三",
    age: 25,
    city: "北京"
};

// 访问属性
console.log(person.name);        // "张三"
console.log(person["age"]);       // 25

// 添加/修改属性
person.job = "工程师";
person.age = 26;

// 删除属性
delete person.city;

// 遍历
for (let key in person) {
    console.log(`${key}: ${person[key]}`);
}

// Object.keys() - 获取所有键
console.log(Object.keys(person));  // ["name", "age", "job"]

// Object.values() - 获取所有值
console.log(Object.values(person));  // ["张三", 26, "工程师"]

// Object.entries() - 获取键值对
console.log(Object.entries(person));
// [["name", "张三"], ["age", 26], ["job", "工程师"]]

// 解构赋值
let { name, age } = person;
console.log(name, age);  // "张三", 26

// 展开操作符
let person2 = { ...person, city: "上海" };
console.log(person2);
// { name: "张三", age: 26, job: "工程师", city: "上海" }
```

## 3.4 函数

### 函数声明

```javascript
// C++: int add(int a, int b) { return a + b; }

function add(a, b) {
    return a + b;
}

console.log(add(3, 5));  // 8
```

### 箭头函数

```javascript
// 箭头函数（类似 C++ 的 lambda）
const add = (a, b) => a + b;

// 多行箭头函数
const calculate = (a, b) => {
    let sum = a + b;
    let product = a * b;
    return { sum, product };
};

// 单参数可以省略括号
const square = x => x * x;
```

### 默认参数

```javascript
function greet(name, greeting = "Hello") {
    return `${greeting}, ${name}!`;
}

console.log(greet("张三"));          // "Hello, 张三!"
console.log(greet("李四", "Hi"));    // "Hi, 李四!"
```

### 可变参数

```javascript
function sumAll(...args) {
    return args.reduce((acc, x) => acc + x, 0);
}

console.log(sumAll(1, 2, 3));  // 6
```

## 3.5 控制流

### 条件语句

```javascript
let x = 15;

if (x > 10) {
    console.log("x 大于 10");
} else if (x > 5) {
    console.log("x 大于 5");
} else {
    console.log("x 小于等于 5");
}

// 三元运算符
let result = x > 10 ? "大于10" : "小于等于10";

// switch
let color = "red";
switch (color) {
    case "red":
        console.log("红色");
        break;
    case "blue":
        console.log("蓝色");
        break;
    default:
        console.log("其他颜色");
}
```

### 循环

```javascript
// for 循环
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// while 循环
let count = 0;
while (count < 5) {
    console.log(count);
    count++;
}

// do...while
let i = 0;
do {
    console.log(i);
    i++;
} while (i < 5);
```

## 3.6 类和面向对象

```javascript
class Person {
    // 构造函数
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    // 方法
    greet() {
        return `你好，我是${this.name}，今年${this.age}岁`;
    }

    // 静态方法
    static getSpecies() {
        return "人类";
    }
}

const p = new Person("张三", 25);
console.log(p.name);           // "张三"
console.log(p.greet());        // "你好，我是张三..."
console.log(Person.getSpecies());  // "人类"
```

### 继承

```javascript
class Student extends Person {
    constructor(name, age, school) {
        super(name, age);  // 调用父类构造函数
        this.school = school;
    }

    study() {
        return `${this.name}在${this.school}学习`;
    }

    // 重写方法
    greet() {
        return super.greet() + `，是${this.school}的学生`;
    }
}

const s = new Student("李四", 20, "清华大学");
console.log(s.greet());  // 重写后的方法
console.log(s.study());  // "李四在清华大学学习"
```

## 3.7 异步编程

### Promise

```javascript
// 创建 Promise
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ data: "成功" });
            // 或 reject(new Error("失败"));
        }, 1000);
    });
};

// 使用 .then()
fetchData()
    .then(result => console.log(result))
    .catch(error => console.error(error));
```

### async/await

```javascript
// 更简洁的异步写法
async function main() {
    try {
        const result = await fetchData();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

main();
```

## 3.8 fetch API（网络请求）

```javascript
// GET 请求
fetch('http://localhost:5000/api/operators')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// async/await 写法
async function getOperators() {
    try {
        const response = await fetch('http://localhost:5000/api/operators');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

// POST 请求
async function calculateDamage(operator) {
    try {
        const response = await fetch('http://localhost:5000/api/calculate-damage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operator })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}
```

## 3.9 DOM 操作（浏览器 API）

```javascript
// 获取元素
const element = document.getElementById('myId');
const elements = document.querySelectorAll('.myClass');

// 修改内容
element.textContent = '新内容';
element.innerHTML = '<strong>HTML</strong>';

// 修改属性
element.setAttribute('src', 'image.jpg');

// 修改样式
element.style.color = 'red';
element.style.display = 'none';

// 添加/移除类
element.classList.add('active');
element.classList.remove('active');
element.classList.toggle('active');

// 创建元素
const newDiv = document.createElement('div');
newDiv.textContent = '新元素';
document.body.appendChild(newDiv);

// 事件监听
element.addEventListener('click', () => {
    console.log('点击了！');
});
```

## 3.10 项目实战：分析 index.html 中的 JavaScript

```javascript
// blog/index.html 中的 JavaScript
let categoryTree = null;
let currentPath = [];

function init() {
    fetch('/blog/config.json')
        .then(response => response.json())
        .then(data => {
            categoryTree = data.categoryTree;
            renderCurrentLevel();
        })
        .catch(error => console.error('Error loading config:', error));
}

function renderCurrentLevel() {
    let node = categoryTree;
    for (const cat of currentPath) {
        node = node.children.find(c => c.name === cat);
        if (!node) break;
    }

    renderBreadcrumb();
    renderContent(node);
}

function renderContent(node) {
    const grid = document.getElementById('contentGrid');
    grid.innerHTML = '';

    if (node.children.length > 0) {
        const section = document.createElement('div');
        section.className = 'categories-section';

        for (const child of node.children) {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.addEventListener('click', () => {
                currentPath.push(child.name);
                renderCurrentLevel();
            });

            card.innerHTML = `
                <div class="category-icon">📁</div>
                <div class="category-info">
                    <h3>${child.name}</h3>
                    <p>${child.children.length} 个子分类 · ${child.posts.length} 篇文章</p>
                </div>
            `;

            section.appendChild(card);
        }

        grid.appendChild(section);
    }
}

init();
```

## 3.11 常用工具函数

```javascript
// 数组去重
const unique = arr => [...new Set(arr)];

// 数组随机打乱
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

// 延迟
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 深拷贝
const deepClone = obj => JSON.parse(JSON.stringify(obj));
```

## 3.12 C++ vs JavaScript 对比

| 特性 | C++ | JavaScript |
|------|-----|-----------|
| 类型系统 | 静态强类型 | 动态弱类型 |
| 内存管理 | 手动/RAII | 垃圾回收 |
| 编译方式 | 编译型 | 解释型 (JIT) |
| 多线程 | 支持 | 单线程 (WebWorker) |
| 重载 | 支持 | 不支持 |
| 模板/泛型 | 支持 | 支持 (泛型函数) |

**下一章：** [React 框架](./04-React框架.md)
