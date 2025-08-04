# Cloudflare Pages 部署指南

## 自动部署（推荐）

### 1. 通过 Cloudflare Dashboard 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 选择您的 GitHub 仓库 `chenleejr/habits-tracker`
6. 配置构建设置：
   - **Framework preset**: React
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Node.js version**: `18`

### 2. 通过 GitHub Actions 自动部署

如果您想使用 GitHub Actions 进行自动部署，需要设置以下 secrets：

1. 在 GitHub 仓库中，进入 **Settings** > **Secrets and variables** > **Actions**
2. 添加以下 secrets：
   - `CLOUDFLARE_API_TOKEN`: 您的 Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID`: 您的 Cloudflare Account ID

#### 获取 Cloudflare API Token：
1. 登录 Cloudflare Dashboard
2. 进入 **My Profile** > **API Tokens**
3. 点击 **Create Token**
4. 使用 **Custom token** 模板
5. 设置权限：
   - **Account**: Cloudflare Pages:Edit
   - **Zone**: Zone:Read (如果使用自定义域名)

#### 获取 Account ID：
1. 在 Cloudflare Dashboard 右侧边栏可以找到 Account ID

## 手动部署

### 使用 Wrangler CLI

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare：
```bash
wrangler login
```

3. 构建项目：
```bash
npm run build
```

4. 部署到 Cloudflare Pages：
```bash
wrangler pages deploy dist --project-name=habits-tracker
```

## 环境变量

如果您的应用需要环境变量，可以在 Cloudflare Pages 的项目设置中添加：

1. 进入您的 Pages 项目
2. 点击 **Settings** > **Environment variables**
3. 添加所需的环境变量

## 自定义域名

1. 在 Cloudflare Pages 项目中，进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入您的域名
4. 按照提示配置 DNS 记录

## 构建优化

当前构建输出显示 JavaScript 包较大（898KB），建议进行以下优化：

1. **代码分割**: 使用动态导入 `import()` 分割代码
2. **手动分块**: 配置 `build.rollupOptions.output.manualChunks`
3. **依赖分析**: 使用 `npm run build -- --analyze` 分析包大小

## 故障排除

### 常见问题：

1. **路由问题**: 确保 `public/_redirects` 文件存在且内容正确
2. **构建失败**: 检查 Node.js 版本是否为 18
3. **环境变量**: 确保所有必需的环境变量都已设置

### 查看部署日志：

1. 在 Cloudflare Pages 项目中查看 **Deployments** 页面
2. 点击具体的部署查看详细日志

## 性能监控

部署后，您可以使用以下工具监控应用性能：

1. **Cloudflare Analytics**: 在 Pages 项目中查看访问统计
2. **Web Vitals**: 监控核心网页指标
3. **Real User Monitoring (RUM)**: 实时用户体验监控