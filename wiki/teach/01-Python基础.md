# 第 1 章：Python 基础（从 C++ 视角）

## 前言

作为 C++/UE 程序员，你会发现 Python 相对简单很多。Python 是解释型语言，不需要编译，语法更简洁。

## 1.1 环境准备

### 安装 Python

```bash
# Mac 系统通常已安装 Python 3
python3 --version

# 如果没有安装，使用 Homebrew
brew install python3
```

### 运行 Python

```bash
# 交互式模式
python3

# 运行脚本
python3 script.py
```

## 1.2 基本语法对比

### 变量定义

| C++ | Python |
|-----|--------|
| `int x = 10;` | `x = 10` |
| `float y = 3.14f;` | `y = 3.14` |
| `std::string s = "hello";` | `s = "hello"` |
| `bool b = true;` | `b = True` |

**Python 特点：**
- 不需要声明类型（动态类型）
- 不需要分号结尾
- 使用缩进代替大括号

### 数据类型

```python
# 整数
a = 10
b = -5

# 浮点数
c = 3.14
d = 2.0

# 字符串
s1 = "双引号"
s2 = '单引号'
s3 = """多行
字符串"""

# 布尔值
flag = True
flag = False

# 列表（类似 C++ 的 std::vector）
my_list = [1, 2, 3, "hello"]

# 字典（类似 C++ 的 std::map）
my_dict = {"key": "value", "name": "张三"}

# 元组（不可变列表）
my_tuple = (1, 2, 3)
```

### 类型转换

```python
# 字符串转整数
num = int("123")

# 整数转字符串
s = str(123)

# 浮点数转整数
i = int(3.14)  # 结果：3
```

## 1.3 控制流

### 条件语句

```python
# C++:
# if (x > 10) {
#     do something;
# } else if (x > 5) {
#     do something;
# } else {
#     do something;
# }

# Python:
x = 15

if x > 10:
    print("x 大于 10")
elif x > 5:
    print("x 大于 5")
else:
    print("x 小于等于 5")
```

### 循环

```python
# for 循环
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# 遍历列表
my_list = [10, 20, 30]
for item in my_list:
    print(item)

# 带索引遍历
for index, item in enumerate(my_list):
    print(f"{index}: {item}")

# while 循环
count = 0
while count < 5:
    print(count)
    count += 1
```

## 1.4 函数

### 函数定义

```python
# C++:
# int add(int a, int b) {
#     return a + b;
# }

# Python:
def add(a, b):
    return a + b

result = add(3, 5)
print(result)  # 8
```

### 默认参数

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("张三"))  # Hello, 张三!
print(greet("李四", "Hi"))  # Hi, 李四!
```

### 可变参数

```python
# 可变位置参数
def sum_all(*args):
    total = 0
    for num in args:
        total += num
    return total

print(sum_all(1, 2, 3))  # 6

# 可变关键字参数
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="张三", age=25)
```

## 1.5 列表（List）操作

列表是 Python 中最常用的数据结构，类似 C++ 的 `std::vector`。

```python
# 创建列表
numbers = [1, 2, 3, 4, 5]

# 访问元素（索引从 0 开始）
print(numbers[0])  # 1
print(numbers[-1])  # 5（最后一个元素）

# 切片
print(numbers[1:3])  # [2, 3]
print(numbers[:3])  # [1, 2, 3]
print(numbers[2:])  # [3, 4, 5]

# 添加元素
numbers.append(6)  # [1, 2, 3, 4, 5, 6]
numbers.insert(0, 0)  # [0, 1, 2, 3, 4, 5, 6]

# 删除元素
numbers.pop()  # 移除最后一个
numbers.remove(3)  # 移除值为 3 的元素

# 列表推导式（类似 C++ 的 ranges）
squares = [x * x for x in range(5)]
print(squares)  # [0, 1, 4, 9, 16]
```

## 1.6 字典（Dict）操作

字典类似 C++ 的 `std::map`，存储键值对。

```python
# 创建字典
person = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}

# 访问值
print(person["name"])  # 张三
print(person.get("age"))  # 25

# 添加/修改
person["job"] = "工程师"
person["age"] = 26

# 遍历
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(key, value)

# 检查键是否存在
if "name" in person:
    print("name 存在")
```

## 1.7 类和面向对象

```python
class Person:
    # 构造函数
    def __init__(self, name, age):
        self.name = name  # 成员变量
        self.age = age

    # 成员函数
    def greet(self):
        return f"你好，我是{self.name}，今年{self.age}岁"

    # 静态方法
    @staticmethod
    def get_species():
        return "人类"


# 使用类
p = Person("张三", 25)
print(p.name)  # 张三
print(p.greet())  # 你好，我是张三，今年25岁
print(Person.get_species())  # 人类
```

### 继承

```python
class Student(Person):
    def __init__(self, name, age, school):
        super().__init__(name, age)  # 调用父类构造函数
        self.school = school

    def study(self):
        return f"{self.name}在{self.school}学习"


s = Student("李四", 20, "清华大学")
print(s.greet())  # 继承自 Person
print(s.study())  # 李四在清华大学学习
```

## 1.8 文件操作

```python
# 读取文件
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(content)

# 逐行读取
with open("file.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())

# 写入文件
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!\n")
    f.write("第二行\n")

# JSON 操作
import json

# 写入 JSON
data = {"name": "张三", "age": 25}
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 读取 JSON
with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)
    print(loaded["name"])
```

## 1.9 模块和包

```python
# 导入模块
import math
print(math.pi)
print(math.sqrt(16))

# 从模块导入特定函数
from math import pi, sqrt
print(pi)
print(sqrt(16))

# 导入并取别名
import math as m
print(m.pi)

# 导入自己的模块
# 创建 mymodule.py
# def hello():
#     print("Hello!")

# 在另一个文件中
import mymodule
mymodule.hello()
```

## 1.10 常用标准库

```python
# os - 操作系统接口
import os
print(os.getcwd())  # 当前工作目录
os.listdir(".")  # 列出目录内容

# sys - 系统相关
import sys
print(sys.version)  # Python 版本

# datetime - 日期时间
from datetime import datetime
now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))

# requests - HTTP 请求（需要安装）
# pip install requests
import requests
response = requests.get("https://api.github.com")
print(response.status_code)
print(response.json())
```

## 1.11 练习项目：update_config.py 分析

让我们分析项目中的 `blog/update_config.py` 脚本：

```python
#!/usr/bin/env python3
import os
import json
from datetime import datetime

def main():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    archive_dir = os.path.join(script_dir, 'archive')
    config_path = os.path.join(script_dir, 'config.json')

    # 站点配置
    site_config = {
        "title": "如珩的博客",
        "subtitle": "技术笔记与分享",
        "author": "如珩"
    }

    posts = []

    # 遍历目录
    if os.path.exists(archive_dir):
        for item in os.listdir(archive_dir):
            item_path = os.path.join(archive_dir, item)
            if os.path.isdir(item_path):
                md_filename = f"{item}.md"
                md_file = os.path.join(item_path, md_filename)
                
                if os.path.exists(md_file):
                    # 获取文件修改时间
                    mtime = os.path.getmtime(item_path)
                    date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
                    
                    post = {
                        "id": item,
                        "title": item,
                        "date": date_str,
                        "path": f"/blog/archive/{item}/",
                        "categories": []
                    }
                    posts.append(post)

    # 按日期排序
    posts.sort(key=lambda x: x["date"], reverse=True)

    # 写入 JSON
    config = {
        "site": site_config,
        "posts": posts
    }

    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)

    print(f"成功更新 config.json，共发现 {len(posts)} 篇文章")

if __name__ == "__main__":
    main()
```

## 1.12 总结

| 概念 | C++ | Python |
|------|-----|--------|
| 变量声明 | 需要类型 | 不需要类型 |
| 语句结尾 | 分号 `;` | 换行 |
| 代码块 | 大括号 `{}` | 缩进 |
| 注释 | `//` 或 `/* */` | `#` |
| 容器 | `std::vector`, `std::map` | `list`, `dict` |
| 函数 | `int func(int a) { return a; }` | `def func(a): return a` |
| 类 | `class MyClass {};` | `class MyClass:` |
| 内存管理 | 手动/RAII | 垃圾回收 |

**下一章：** [Flask 框架](./02-Flask框架.md)
