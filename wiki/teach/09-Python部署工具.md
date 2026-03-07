# 第 9 章：Python 部署工具

上一章我们了解了服务器的基础知识，这一章我们来看看部署 Python Web 应用时会用到的几个工具：venv、Gunicorn 和 Systemd。

---

## 一、venv：Python 虚拟环境

如果你在开发时同时做多个 Python 项目，可能会遇到这样的问题：这个项目需要 Flask 1.0 版本，另一个项目需要 Flask 2.0 版本，如果都安装在系统里，就会冲突。

venv 就是用来解决这个问题的。venv 的全称是 virtual environment，也就是虚拟环境。它可以为每个项目创建一个隔离的 Python 环境，不同项目的依赖互不干扰。

### 为什么需要虚拟环境？

在理解虚拟环境之前，我们先看看没有虚拟环境会怎么样。

当你安装一个 Python 包时，默认是安装到系统的 Python 环境里的。所有项目都共享这个环境。如果你有两个项目，一个需要 Flask 1.0，另一个需要 Flask 2.0，这就麻烦了——你不可能同时安装两个版本的 Flask。

即使版本不冲突，如果你想把项目分享给别人，或者部署到服务器上，你也不知道该告诉别人安装哪些依赖，因为系统里安装了太多别的项目用的包了。

虚拟环境就是来解决这些问题的。

### 什么是虚拟环境？

虚拟环境，简单来说，就是一个文件夹，里面包含了一个独立的 Python 解释器，以及这个项目专用的包安装目录。

每个虚拟环境都是独立的，在这个环境里安装的包，不会影响系统的 Python，也不会影响其他虚拟环境。

这就像是每个项目有自己的一间书房，里面放着这个项目需要的书。不同项目的书房是分开的，不会互相干扰。

### 如何创建虚拟环境？

创建虚拟环境很简单，只需要一条命令：

```bash
python3 -m venv venv
```

这里的第一个 venv 是 Python 的模块名，第二个 venv 是我们给虚拟环境起的名字（通常就叫 venv）。

运行这条命令后，会在当前目录下创建一个 venv 文件夹，里面包含一个独立的 Python 环境。

如果你看看 venv 文件夹，会发现里面有 bin 目录（Windows 是 Scripts 目录），里面有 python 和 pip 等可执行文件；还有 lib 目录，里面是包的安装位置。

### 如何使用虚拟环境？

创建好虚拟环境后，还需要激活它才能使用：

```bash
source venv/bin/activate
```

在 Windows 上，命令是：

```bash
venv\Scripts\activate
```

激活后，你的终端提示符前面会出现一个 (venv) 标记，表示你现在在虚拟环境里了。

在虚拟环境里，你安装的包（比如 pip install flask）只会安装在这个虚拟环境里，不会影响系统的 Python，也不会影响其他项目的虚拟环境。

当你完成工作，想退出虚拟环境时，只需要输入：

```bash
deactivate
```

### requirements.txt：记录依赖

当你把项目分享给别人，或者部署到服务器上时，别人需要知道安装哪些依赖。手动一个个安装太麻烦了，而且容易出错。

这时候 requirements.txt 就派上用场了。requirements.txt 是一个文本文件，里面列出了项目所有的依赖，以及版本号。

生成 requirements.txt 很简单，在虚拟环境里运行：

```bash
pip freeze > requirements.txt
```

这条命令会把当前虚拟环境里安装的所有包及其版本输出到 requirements.txt 文件里。

当别人拿到你的项目时，只需要运行：

```bash
pip install -r requirements.txt
```

就能安装所有需要的依赖了，非常方便。

---

## 二、Gunicorn：Python WSGI 服务器

在开发 Flask 应用时，我们直接运行 `python app.py` 就能启动服务器，浏览器也能访问。但这只适合开发时使用，不适合在生产环境使用。

Flask 自带的服务器是单线程的，而且不够稳定，也不能很好地处理高并发。在生产环境，我们需要一个更强大的 WSGI 服务器，Gunicorn 就是最常用的选择之一。

### 什么是 WSGI？

在讲 Gunicorn 之前，先说说 WSGI。WSGI 的全称是 Web Server Gateway Interface，也就是 Web 服务器网关接口。它是 Python Web 应用和 Web 服务器之间的一个标准接口。

有了 WSGI 这个标准，不同的 Web 应用框架（Flask、Django 等等）和不同的 Web 服务器（Gunicorn、uWSGI 等等）就可以协同工作，而不需要为每一个组合写专门的适配代码。

你可以把 WSGI 想象成电源插座标准。有了统一的插座标准，任何电器都能插到任何插座上，不需要每个电器配专门的插座。

### 为什么需要 Gunicorn？

Flask 自带的服务器（也就是 `app.run()` 启动的那个服务器）简单易用，但它是为开发设计的，不是为生产环境设计的。它有几个问题：

- 它是单线程的，一次只能处理一个请求
- 它不够稳定，遇到错误可能会崩溃
- 它没有进程管理，崩溃后不会自动重启
- 它不能很好地利用多核 CPU

Gunicorn 则不同，它是一个高性能的 WSGI 服务器，专门为生产环境设计。它可以启动多个 worker 进程，同时处理多个请求，效率高得多，也稳定得多。

### 如何使用 Gunicorn？

使用 Gunicorn 也很简单。首先安装它：

```bash
pip install gunicorn
```

然后用 Gunicorn 启动你的 Flask 应用：

```bash
gunicorn --workers 4 --bind 127.0.0.1:5000 app:app
```

这条命令的意思是：
- `--workers 4`：启动 4 个 worker 进程
- `--bind 127.0.0.1:5000`：绑定到本地 5000 端口
- `app:app`：第一个 app 是文件名（app.py），第二个 app 是 Flask 应用对象名

启动后，Gunicorn 就在后台运行了，监听 5000 端口，等待请求。

### 该启动多少个 worker？

`--workers` 参数指定启动多少个 worker 进程。那该设置多少呢？

一般来说，worker 数量建议设置为 CPU 核心数的 2 倍加 1。比如：
- 1 核 CPU：3 个 worker
- 2 核 CPU：5 个 worker
- 4 核 CPU：9 个 worker

这只是一个经验公式，你可以根据实际情况调整。worker 太少，不能充分利用 CPU；worker 太多，进程切换的开销会变大，反而降低性能。

---

## 三、Systemd：管理系统服务

现在我们有了 Gunicorn 运行 Flask 后端，但还有一个问题：如果服务器重启了，Gunicorn 不会自动启动，我们得手动去启动它，这太麻烦了。

Systemd 就是用来解决这个问题的。Systemd 是 Linux 系统的服务管理器，它可以让我们的应用在系统启动时自动启动，崩溃时自动重启，并且方便我们查看日志、管理状态。

### 什么是服务？

在 Systemd 的语境里，服务就是一个长期运行在后台的程序。比如 Nginx 是一个服务，MySQL 是一个服务，我们的 Gunicorn 进程也可以做成一个服务。

把程序做成服务有很多好处：
- 系统启动时自动启动
- 程序崩溃时自动重启
- 可以方便地查看状态和日志
- 可以统一管理，不用记各种命令

### 如何创建 Systemd 服务？

要创建一个 Systemd 服务，我们需要写一个服务配置文件，通常放在 `/etc/systemd/system/` 目录下。

比如，我们创建一个叫 `zmddmg.service` 的文件：

```ini
[Unit]
Description=ZmdDmg Flask Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/myWeb/ZmdDmg/backend
Environment="PATH=/var/www/myWeb/ZmdDmg/backend/venv/bin"
ExecStart=/var/www/myWeb/ZmdDmg/backend/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

这个文件的内容看起来有点复杂，我们逐段来看：

- **[Unit] 部分**：描述这个服务的基本信息
  - `Description`：服务的描述
  - `After`：指定这个服务应该在什么之后启动（这里是网络就绪后）

- **[Service] 部分**：服务的具体配置
  - `User` 和 `Group`：以哪个用户和组的身份运行
  - `WorkingDirectory`：工作目录
  - `Environment`：环境变量（这里设置 PATH 为虚拟环境的 bin 目录）
  - `ExecStart`：启动服务时执行的命令
  - `Restart=always`：服务崩溃时总是自动重启

- **[Install] 部分**：安装配置
  - `WantedBy=multi-user.target`：让服务在系统进入多用户模式时自动启动

### 如何管理服务？

创建好配置文件后，我们就可以用 systemctl 命令来管理服务了：

```bash
# 重新加载 Systemd，让它看到新服务
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start zmddmg

# 让服务开机自启
sudo systemctl enable zmddmg

# 查看服务状态
sudo systemctl status zmddmg

# 停止服务
sudo systemctl stop zmddmg

# 重启服务
sudo systemctl restart zmddmg

# 查看服务日志
sudo journalctl -u zmddmg -f
```

这里的 `-f` 参数表示跟随（follow），实时显示最新的日志，按 Ctrl+C 退出。

有了 Systemd，我们就不用担心服务意外停止了，也不用每次服务器重启后手动去启动服务了。

---

## 四、总结

这一章我们了解了 Python 部署相关的几个工具。

venv 为 Python 项目创建隔离的环境，避免依赖冲突，也方便分享项目。Gunicorn 是生产环境用的 WSGI 服务器，比 Flask 自带的服务器更强大、更稳定。Systemd 管理系统服务，让服务自动启动、自动重启、方便管理。

这三个工具配合使用，就能把 Python Web 应用部署好了。

下一章，我们来了解 Web 相关的技术：Nginx、DNS、HTTPS 和 SSL 证书。

---

**下一章：** [第 10 章：Web 与安全](./10-Web与安全.md)
