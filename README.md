# 履历工坊

一个可以直接使用的在线简历生成器。它保留原项目的纸张感、深灰标题条、青绿色时间轴和紧凑信息结构，同时提供现代化的编辑体验。

## 能做什么

- 编辑基本信息、工作经历、专业技能、教育经历和自我评价
- 右侧实时预览时间轴简历
- 调整主题色与内容密度
- 自动保存在当前浏览器中，不上传简历数据
- 导入、导出 JSON 备份
- 通过浏览器打印为 A4 或保存为 PDF
- 在手机端切换编辑和预览

## 本地运行

推荐使用 Node.js 22 LTS（22.13 或更高版本）或 Node.js 24。

```bash
npm install
npm run dev
```

## 验证

```bash
npm run lint
npm test
```

## 技术栈

- React 19
- Next.js App Router API
- vinext + Vite
- Cloudflare Workers / Codex Sites 兼容构建
