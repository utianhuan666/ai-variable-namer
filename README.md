# AI 变量命名助手

一款强大的 VS Code 扩展，使用 AI 技术为您的代码提供智能变量和方法命名建议。

![扩展图标](resources/icon.png)

## 主要功能

- **智能变量命名**：基于选中文本和上下文，生成符合编程语言习惯的变量名
- **智能方法命名**：为函数/方法生成以动词开头的专业命名
- **多种命名风格支持**：camelCase、snake_case、PascalCase、kebab-case
- **多语言适配**：自动检测或手动指定编程语言，遵循对应语言的命名习惯
- **高品质建议**：每个命名建议都附带详细的解释说明
- **上下文感知**：分析选中文本周围的代码，提供更准确的命名建议

## 安装方法

### 从 VS Code 扩展市场安装

1. 打开 VS Code
2. 按下 `Ctrl+Shift+X` 打开扩展视图
3. 搜索 "AI 变量命名助手"
4. 点击 "安装" 按钮

### 手动安装

1. 从 [GitHub Releases](https://github.com/utianhuan666/ai-variable-namer/releases) 下载 `.vsix` 文件
2. 在 VS Code 中，点击 "查看 > 命令面板"（或按 `Ctrl+Shift+P`）
3. 输入 "安装来自 VSIX 的扩展" 并选择下载的文件

## 使用方法

### 基本使用

1. 在代码编辑器中选中要命名的文本描述（中文或英文均可）
2. 右键点击，从上下文菜单中选择 **AI 命名助手**
3. 根据需要选择 **AI 变量命名** 或 **AI 方法命名**
4. 从弹出的建议列表中选择一个名称

### 快捷键

- 变量命名：`Ctrl+Alt+V` (Windows/Linux) 或 `Cmd+Alt+V` (Mac)
- 方法命名：`Ctrl+Alt+M` (Windows/Linux) 或 `Cmd+Alt+M` (Mac)

## 配置选项

在 VS Code 设置中可以自定义以下选项：

- **API 密钥**：设置您的 AI 服务 API 密钥
- **命名风格**：选择变量命名的风格（camelCase、snake_case 等）
- **编程语言**：指定生成变量名时参考的编程语言习惯
- **AI 模型**：选择用于生成命名建议的 AI 模型

## 示例

### 变量命名

选择描述文本：
```
用户每日登录次数的最大值
```

生成的建议：
- `maxDailyLoginCount` - Clearly represents the maximum number of daily logins
- `dailyLoginLimit` - Indicates the upper threshold for login attempts per day
- `maxUserLoginsPerDay` - Explicitly states it's the maximum logins per day for users

### 方法命名

选择描述文本：
```
验证用户密码是否符合安全规则
```

生成的建议：
- `validatePasswordSecurity` - Clearly expresses the password validation purpose
- `checkPasswordCompliance` - Indicates checking password against security rules
- `verifyPasswordMeetsSecurityRules` - Explicitly states the verification against security rules

## 常见问题

**Q: 如何查看调试日志？**

A: 使用命令面板 (`Ctrl+Shift+P`) 执行 "显示 AI 变量命名调试日志" 命令。

**Q: 为什么 AI 响应较慢？**

A: AI 响应速度取决于您的网络连接和所选 AI 模型。大型模型可能需要更长的响应时间，但通常可以提供更好的命名建议。

## 许可证

MIT

---

Made with ❤️ by utianhuan666 | [GitHub 仓库](https://github.com/utianhuan666/ai-variable-namer)
