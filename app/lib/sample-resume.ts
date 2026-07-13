import type { ResumeData, ResumeStyle } from "./resume";

export const sampleResume: ResumeData = {
  version: 1,
  profile: {
    name: "林见川",
    title: "Agent 开发工程师",
    phone: "138-0013-8000",
    email: "jianchuan.lin@example.com",
    location: "北京 · 中国",
    website: "github.com/agent-lab",
    wechatId: "",
    wechatQr: "",
    wechatQrCropVersion: 2,
  },
  experience: [
    {
      id: "exp-bytedance",
      company: "字节跳动",
      role: "高级 Agent 开发工程师",
      start: "2022年7月",
      end: "至今",
      highlights: [
        "负责企业级 Agent 平台的架构与核心模块研发，支持工具调用、长期记忆、工作流编排和人工确认",
        "落地多 Agent 协作框架，将复杂任务拆分为规划、检索、执行与校验节点，重点场景任务完成率提升 28%",
        "建设知识库 RAG 链路，整合权限过滤、混合检索、重排序与引用溯源，覆盖产品、运营和客服等业务场景",
        "搭建 Agent 评测与可观测体系，沉淀离线数据集、链路追踪、提示词版本管理和自动回归能力",
      ],
      technologies: "Python、TypeScript、LangGraph、FastAPI、PostgreSQL、Redis、Elasticsearch、Kubernetes",
    },
    {
      id: "exp-tencent",
      company: "腾讯",
      role: "智能交互平台研发工程师",
      start: "2018年7月",
      end: "2022年6月",
      highlights: [
        "参与智能客服与知识问答平台建设，负责对话状态管理、意图识别服务和答案召回链路",
        "设计可配置的技能插件体系，打通搜索、工单、CRM 等内部服务，支持业务团队低代码编排对话流程",
        "建设统一模型服务网关，完善限流、缓存、降级和灰度机制，核心服务可用性提升至 99.95%",
        "推动服务容器化和自动化交付，补齐监控告警与故障演练机制，版本交付周期缩短 40%",
      ],
      technologies: "Go、Python、Java、gRPC、MySQL、Redis、Kafka、Docker",
    },
  ],
  skills: [
    { id: "skill-agent", name: "Agent 工程", items: "任务规划、工具调用、多 Agent 协作、记忆系统、Human-in-the-loop" },
    { id: "skill-llm", name: "大模型应用", items: "Prompt Engineering、RAG、Function Calling、模型评测、Guardrails" },
    { id: "skill-language", name: "编程语言", items: "Python、TypeScript、Go、Java、SQL" },
    { id: "skill-platform", name: "工程平台", items: "FastAPI、LangGraph、PostgreSQL、Redis、Kafka、Elasticsearch" },
    { id: "skill-infra", name: "云原生与观测", items: "Docker、Kubernetes、OpenTelemetry、Prometheus、GitHub Actions" },
  ],
  education: [
    {
      id: "edu-tsinghua",
      school: "清华大学",
      major: "计算机科学与技术 · 本科",
      start: "2014年9月",
      end: "2018年6月",
    },
  ],
  evaluation: [
    "兼具大模型应用落地与后端工程经验，能够把不确定的模型能力封装为稳定、可评测、可观测的产品能力",
    "重视问题定义与快速验证，习惯用最小闭环验证 Agent 方案，再通过数据和用户反馈持续迭代",
    "具备良好的跨团队协作能力，能够推动算法、产品、平台与业务团队共同完成复杂项目落地",
  ],
};

export const defaultStyle: ResumeStyle = {
  accent: "#2d8c87",
  density: "comfortable",
};
