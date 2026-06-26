# CODEBUDDY.md
This file provides guidance to CodeBuddy when working with code in this repository.

## 常用命令

| 用途 | 命令 |
|------|------|
| 安装依赖 | `pip install -r app/requirements.txt` |
| 运行开发版 | `python app/main.py` |
| 打包为单文件 EXE | 执行 `app/build.bat`，输出 `dist/MyApp.exe` |
| 快速启动（含安装依赖） | 双击 `app/run.bat` |

> 所有 Python 包依赖均定义在 `app/requirements.txt`（PyQt6 + PyQt6-WebEngine）。
> HTML/CSS/JS 为纯前端，无需构建。

## 部署

推送到 GitHub 后，Actions 自动将 `app/web/` 部署到 GitHub Pages：
```bash
git add .
git commit -m "initial"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin master
```
部署完成后访问 `https://<你的用户名>.github.io/<仓库名>/`。

## 项目架构

这是一个**混合架构的桌面待办事项应用**：前端使用纯 HTML/CSS/JS（无框架），后端使用 PyQt5 + QWebEngineView 将其包装为原生桌面窗口。

### 目录结构

```
myhtml/
└── app/
    ├── web/                  # 前端资源（桌面应用加载的页面）
    │   ├── index.html         # 入口页面 — 待办事项应用
    │   ├── css/
    │   │   ├── style.css      # 主样式（深色主题、动效、响应式）
    │   │   └── flatpickr.min.css
    │   └── js/
    │       ├── app.js         # 主逻辑（CRUD、过滤、分组、持久化）
    │       ├── flatpickr.min.js
    │       └── flatpickr.zh.js
    ├── main.py                # PyQt5 桌面窗口入口
    ├── requirements.txt       # Python 依赖
    ├── build.bat              # PyInstaller 打包脚本
    └── run.bat                # 开发运行脚本
```

### 前端（web/）

- **数据流**: 所有任务数据存储在 `localStorage`，键为 `tasks`。`app.js` 中的 `save()` / `render()` 是唯二的数据读写入口。
- **四象限优先级**: 基于艾森豪威尔矩阵（重要紧急 / 重要不紧急 / 不重要紧急 / 不重要不紧急），任务按优先级排序、以颜色区分。
- **截止日期**: 原生 `datetime-local` 输入，显示相对日期标签（今天/明天/逾期等）。
- **过滤与分组**: 支持按状态过滤（全部/待完成/已完成）和按时序分组（不分组/按天/按周/按月）。
- **动效与交互**: 完成任务的纸屑动画、删除的滑出动画、待办项的悬浮效果。

### 后端（main.py）

- 使用 `QWebEngineView` 加载本地 `web/index.html`。
- 提供顶部工具栏（重新加载按钮 + F5 快捷键），方便开发时刷新页面。
- 通过 `PyInstaller` 可打包为独立的单文件 EXE（含 `--add-data "web;web"` 内嵌前端资源）。

### 数据模型

任务对象结构：
```javascript
{
  id: number,          // Date.now()
  text: string,        // 任务内容
  done: boolean,       // 是否完成
  createdAt: number,   // 创建时间戳（毫秒）
  priority: string,    // 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important'
  dueDate: string|null // ISO datetime 字符串或 null
}
```

排序规则：先按优先级（重要紧急 > 重要不紧急 > 不重要紧急 > 不重要不紧急），再按创建时间倒序。
