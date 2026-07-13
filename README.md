# 丁爱民的在线简历

现代化、数据驱动的单页技术简历。新版保留旧项目的纸张感、深灰标题条、青绿色时间轴和紧凑信息结构，同时移除了 Node 7、Gulp、Jade、Less 与字体图标依赖。

## 本地运行

推荐使用 Node.js 22 LTS（22.13 或更高版本）或 Node.js 24。

```bash
npm install
npm run dev
```

浏览器访问终端显示的本地地址即可。修改简历内容时，编辑根目录的 `resume.json`；页面结构与样式分别位于 `app/page.tsx` 和 `app/globals.css`。

## 检查与构建

```bash
npm run lint
npm test
```

页面支持：

- 桌面与移动端自适应
- 舒展/紧凑密度切换
- 浏览器打印与 A4 打印样式
- Codex Sites 部署输出

## 技术栈

- React 19
- Next.js App Router API
- vinext + Vite
- Cloudflare Workers 兼容构建
