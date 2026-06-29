<p align="center">
  <img src="frontend/public/logo-new.jpg" alt="城市补贴雷达" width="120">
</p>

<h1 align="center">城市补贴雷达</h1>

<p align="center">
  <strong>应届毕业生的补贴查询神器</strong>
</p>

<p align="center">
  输入条件，一键匹配你能领的补贴
</p>

<p align="center">
  <a href="https://github.com/chi-ga/city-subsidy-radar/stargazers">
    <img src="https://img.shields.io/github/stars/chi-ga/city-subsidy-radar" alt="Stars">
  </a>
  <a href="https://github.com/chi-ga/city-subsidy-radar/network/members">
    <img src="https://img.shields.io/github/forks/chi-ga/city-subsidy-radar" alt="Forks">
  </a>
  <a href="https://github.com/chi-ga/city-subsidy-radar/issues">
    <img src="https://img.shields.io/github/issues/chi-ga/city-subsidy-radar" alt="Issues">
  </a>
  <a href="https://github.com/chi-ga/city-subsidy-radar/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/chi-ga/city-subsidy-radar" alt="License">
  </a>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#支持项目">支持项目</a>
</p>

---

## 简介

城市补贴雷达帮助应届毕业生快速查询目标城市的人才补贴政策。只需输入毕业院校、学历、专业等条件，系统自动匹配你能申领的补贴，告诉你还差什么条件能拿更多，生成落地待办清单。

**项目状态**：Demo 阶段，持续迭代中。当前已完成 MVP 核心功能，后续将持续扩展城市覆盖、补充政策数据、完善 AI 功能。

**当前覆盖城市**：北京、上海、深圳、广州

---

## 为什么做这个项目

作为应届毕业生，我在申请深圳市青年人才认定时，发现自己不符合任何一条认定路径。但政策中有一条"创新贡献类"认定标准：

> GitHub 开源项目 Fork > 200 且上一年贡献度 > 200

于是我做了这个在线工具，帮助应届毕业生根据自身条件一键匹配补贴政策和申请渠道。如果你觉得有用，欢迎 Star 和 Fork 支持！

**如果你觉得这个项目有用，请给个 Star 和 Fork 支持一下，帮助我达成 200 Forks 的目标！**

---

## 功能特性

### 三种查询路径

| 路径 | 说明 |
|------|------|
| **我能拿到什么** | 选择目标城市，输入条件，匹配该城市补贴 |
| **哪个城市对我更好** | 不选城市，同时对比四城补贴总额 |
| **查看政策** | 按城市、区域、类型筛选浏览全部政策 |

### 核心功能

- **院校自动补全** — 1,176 所院校（813 所国内 + 363 所境外），支持中文/拼音/简称/别名搜索，自动标记 985/211/双一流/省重点等层次
- **专业自动补全** — 805 个本科专业（12 门类、93 专业类，含 2024 年新增 24 种专业）+ 研究生学科目录，一级学科采用 2022 版标准，深圳模式自动判定重点产业领域
- **智能匹配引擎** — 前端规则匹配，支持互斥组处理、多通道认定、政策分层过滤
- **预估金额计算** — 分学历档位计算，互斥组取最高值
- **反向匹配** — 告诉你差什么条件能拿更多补贴
- **落地待办清单** — 针对性生成材料准备、申请渠道、截止时间等待办事项
- **城市专属字段** — 深圳重点产业/STEM/拔尖计划、北京三城一区、上海临港等城市特有政策适配

### 数据规模

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 补贴政策 | 45 条 | 覆盖北上广深四城 |
| 院校数据 | 1,176 所 | 813 所国内高校（39 所 985 + 115 所 211 + 145 所双一流 + 236 所省重点 + 432 所普通本科）+ 363 所境外高校 |
| 本科专业 | 805 个 | 12 个门类、93 个专业类，含 2024 年新增 24 种专业，一级学科名称采用 2022 年版研究生教育学科专业目录 |
| 双一流学科 | 147 校 × 501 条 | 第二轮双一流建设高校及学科 |
| 深圳重点产业专业 | 263 个 | 65 个研究生学科 + 198 个本科专业 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite |
| 路由 | React Router DOM 7 |
| 状态管理 | Zustand |
| CSS 框架 | Tailwind CSS |
| 图表/地图 | ECharts |
| 测试 | Vitest + Testing Library |

**架构特点**：
- 纯前端 SPA，无后端服务，无数据库
- 补贴数据以静态 JSON 内嵌，规则引擎前端执行
- 数据持久化：sessionStorage（表单）+ localStorage（配置）

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/chi-ga/city-subsidy-radar.git

# 进入前端项目目录
cd city-subsidy-radar/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 项目结构

```
city-subsidy-radar/
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── Home/           # 首页（中国地图）
│   │   │   ├── Input/          # 条件输入页
│   │   │   ├── Result/         # 结果分析页
│   │   │   ├── Compare/        # 城市对比页
│   │   │   └── Policies/       # 政策库页
│   │   ├── components/         # 通用组件
│   │   │   ├── Map/            # 地图组件
│   │   │   ├── Form/           # 表单组件
│   │   │   └── PolicyCard.tsx  # 政策卡片
│   │   ├── data/               # 静态数据
│   │   │   ├── subsidies/      # 各城市补贴规则 JSON
│   │   │   ├── schools.json    # 院校数据
│   │   │   └── major_catalog.json # 专业目录
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── stores/             # Zustand 状态管理
│   │   ├── utils/              # 工具函数
│   │   └── types/              # TypeScript 类型定义
│   └── public/                 # 静态资源
├── policy/                     # 政策原文文档
└── README.md
```

---

## 支持项目

如果这个项目对你有帮助，可以通过以下方式支持：

1. **Star** — 点击右上角 Star 按钮，让更多人看到
2. **Fork** — Fork 后自行修改，添加你所在城市的补贴数据
3. **Issue** — 发现问题或有建议，欢迎提 Issue
4. **PR** — 欢迎提交 PR，一起完善项目

**目标**：200 Forks，帮助我达成深圳市青年人才认定的"创新贡献类"标准！

---

## 后续规划

- [ ] 扩展更多城市（杭州、成都、武汉、南京等）
- [ ] 补充更多补贴政策数据
- [ ] 开放 AI 个性化解读功能入口（代码已实现，Demo 阶段隐藏设置页）
- [ ] 优化移动端体验
- [ ] 添加政策更新提醒

---

## 相关文档

- [更新日志](./CHANGELOG.md) — 版本更新记录
- [贡献指南](./CONTRIBUTING.md) — 如何参与贡献
- [许可证](./LICENSE) — MIT License

## 许可

MIT

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/chi-ga">chi-ga</a>
</p>
