# 贡献指南

感谢你对城市补贴雷达项目的关注！欢迎通过以下方式参与贡献。

## 如何贡献

### 报告问题

如果你发现了 Bug 或有功能建议，请 [提交 Issue](https://github.com/chi-ga/city-subsidy-radar/issues/new)。

请包含以下信息：
- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器、操作系统等）

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feature/your-feature`
3. 提交你的修改：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 添加城市补贴数据

如果你想添加新城市的补贴数据：

1. 在 `city-subsidy-radar/src/data/subsidies/` 下创建新的 JSON 文件
2. 参照现有城市的数据结构（如 `shenzhen.json`）
3. 在 `src/data/city-conditions.json` 中配置城市专属字段（如有）
4. 更新 `src/constants.ts` 中的城市列表
5. 提交 Pull Request

## 开发规范

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型包括：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 不使用分号
- 遵循 ESLint + Prettier 配置

运行格式化：
```bash
npm run format
```

运行检查：
```bash
npm run lint
```

## 联系方式

如有疑问，欢迎通过 Issue 或 Discussion 交流。

再次感谢你的贡献！
