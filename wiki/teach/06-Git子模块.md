# 第 6 章：Git 子模块

## 前言

Git 子模块（Submodules）允许你将一个 Git 仓库作为另一个 Git 仓库的子目录。对于 UE 程序员，可以想象成类似 UE 的插件或外部依赖。

## 6.1 什么是 Git 子模块？

子模块让你可以：
- 在一个仓库中包含其他仓库
- 每个子模块有独立的版本控制
- 主仓库只记录子模块的引用（commit hash）

## 6.2 添加子模块

```bash
# 添加子模块
git submodule add <仓库URL> <本地路径>

# 示例：添加博客子模块
git submodule add https://github.com/NanoShiki/Blog.git blog

# 示例：添加 ZmdDmg 子模块
git submodule add https://github.com/NanoShiki/ZmdDmg.git ZmdDmg
```

添加后会发生什么：
1. 克隆子模块到指定目录
2. 创建 `.gitmodules` 文件记录子模块信息
3. 在主仓库中记录子模块的 commit

## 6.3 .gitmodules 文件

```ini
[submodule "blog"]
    path = blog
    url = https://github.com/NanoShiki/Blog.git
[submodule "ZmdDmg"]
    path = ZmdDmg
    url = https://github.com/NanoShiki/ZmdDmg.git
```

## 6.4 克隆包含子模块的仓库

```bash
# 方法 1：使用 --recursive
git clone --recursive <主仓库URL>

# 方法 2：先克隆，再初始化子模块
git clone <主仓库URL>
cd <仓库目录>
git submodule update --init --recursive

# 方法 3：分步执行
git clone <主仓库URL>
cd <仓库目录>
git submodule init
git submodule update
```

## 6.5 更新子模块

### 拉取子模块的最新更改

```bash
# 进入子模块目录
cd blog

# 拉取最新代码
git pull origin main

# 或者使用 fetch + merge
git fetch
git merge origin/main

# 返回主仓库
cd ..

# 提交子模块的更新
git add blog
git commit -m "更新 blog 子模块"
```

### 批量更新所有子模块

```bash
# 更新所有子模块到主仓库记录的版本
git submodule update

# 更新所有子模块到最新版本
git submodule update --remote

# 递归更新（如果子模块也有子模块）
git submodule update --recursive --remote
```

## 6.6 在子模块中工作

子模块本质上是一个独立的 Git 仓库，你可以在里面进行正常的 Git 操作。

```bash
# 进入子模块
cd blog

# 查看状态
git status

# 创建分支
git checkout -b feature/new-post

# 修改文件
git add .
git commit -m "添加新文章"

# 推送到子模块的远程仓库
git push origin feature/new-post

# 返回主仓库
cd ..

# 主仓库看到子模块有更新
git status

# 提交子模块的变更
git add blog
git commit -m "更新 blog 子模块到新 commit"
git push
```

## 6.7 查看子模块状态

```bash
# 查看子模块状态
git submodule status

# 示例输出：
#  a1b2c3d... blog (heads/main)
#  d4e5f6g... ZmdDmg (heads/main)

# 前面的 + 表示有未提交的更改
# 前面的 - 表示未初始化
```

## 6.8 删除子模块

```bash
# 1. 从 .gitmodules 中移除
git submodule deinit -f blog

# 2. 从 Git 中移除
git rm --cached blog

# 3. 删除子模块目录
rm -rf blog

# 4. 提交更改
git add .
git commit -m "移除 blog 子模块"
```

## 6.9 常用命令速查

| 命令 | 说明 |
|------|------|
| `git submodule add <url> <path>` | 添加子模块 |
| `git clone --recursive <url>` | 克隆包含子模块的仓库 |
| `git submodule init` | 初始化子模块 |
| `git submodule update` | 更新子模块到记录的版本 |
| `git submodule update --remote` | 更新子模块到最新版本 |
| `git submodule status` | 查看子模块状态 |
| `git submodule deinit <path>` | 移除子模块 |

## 6.10 子模块工作流程

### 日常开发流程

```bash
# 1. 开始工作前，确保子模块是最新的
git pull
git submodule update --init --recursive

# 2. 在子模块中工作
cd ZmdDmg
git checkout main
git pull
# 修改代码...
git add .
git commit -m "新功能"
git push

# 3. 更新主仓库中的子模块引用
cd ..
git add ZmdDmg
git commit -m "更新 ZmdDmg"
git push
```

### 协作者同步流程

```bash
# 1. 拉取主仓库更新
git pull

# 2. 更新子模块
git submodule update --init --recursive
```

## 6.11 项目实战：当前项目分析

查看当前项目的子模块：

```bash
# 查看 .gitmodules
cat .gitmodules

# 输出：
# [submodule "blog"]
#     path = blog
#     url = https://github.com/NanoShiki/Blog.git
# [submodule "ZmdDmg"]
#     path = ZmdDmg
#     url = https://github.com/NanoShiki/ZmdDmg.git

# 查看子模块状态
git submodule status
```

### 更新 blog 子模块

```bash
# 进入 blog 目录
cd blog

# 拉取最新代码
git pull origin main

# 返回主仓库
cd ..

# 查看变更
git status

# 提交更新
git add blog
git commit -m "更新博客子模块"
git push
```

## 6.12 常见问题

### Q: 子模块目录是空的？
A: 运行 `git submodule update --init`

### Q: 如何切换子模块的分支？
A: 进入子模块目录，正常使用 `git checkout`

### Q: 子模块的更改会影响主仓库吗？
A: 子模块的更改只在子模块仓库中，主仓库只记录子模块的 commit hash

## 6.13 总结

Git 子模块的关键点：
- 子模块是独立的 Git 仓库
- 主仓库只记录子模块的 commit hash
- 需要单独提交子模块的更新
- 克隆时使用 `--recursive` 或后续初始化

**下一章：** [项目实战](./07-项目实战.md)
