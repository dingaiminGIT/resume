import type { ResumeData, ResumeStyle } from "./resume";

export const sampleResume: ResumeData = {
  version: 1,
  profile: {
    name: "陈默",
    title: "后端开发工程师",
    phone: "138-0013-8000",
    email: "chenmo@example.com",
    location: "上海 · 中国",
    website: "github.com/example",
    wechatId: "",
    wechatQr: "",
    wechatQrCropVersion: 2,
  },
  experience: [
    {
      id: "exp-cloud",
      company: "云舟科技",
      role: "高级后端开发工程师",
      start: "2021年3月",
      end: "至今",
      highlights: [
        "负责核心业务平台的后端架构设计与开发，推动关键模块的技术选型与落地",
        "构建高性能、高可用、可扩展的分布式服务体系，支撑业务持续迭代",
        "设计并实现高并发订单服务，支持每秒 10 万+ 请求，响应时间降低 60%",
      ],
      technologies: "Java、Spring Boot、MySQL、Redis、RocketMQ、Elasticsearch、Docker",
    },
    {
      id: "exp-data",
      company: "智云数据",
      role: "后端开发工程师",
      start: "2018年6月",
      end: "2021年2月",
      highlights: [
        "参与数据平台的后端开发与维护，负责数据处理与服务接口开发",
        "优化数据计算任务调度，任务执行效率提升 70%，故障恢复时间缩短 50%",
      ],
      technologies: "Java、Spring、MyBatis、MySQL、Redis、Kafka",
    },
  ],
  skills: [
    { id: "skill-language", name: "编程语言", items: "Java、Kotlin、SQL、Shell" },
    { id: "skill-framework", name: "后端框架", items: "Spring Boot、Spring Cloud、MyBatis" },
    { id: "skill-platform", name: "工具与平台", items: "Docker、Kubernetes、Git、Jenkins、Prometheus" },
  ],
  education: [
    {
      id: "edu-university",
      school: "江南理工大学",
      major: "软件工程 · 本科",
      start: "2014年9月",
      end: "2018年6月",
    },
  ],
  evaluation: [
    "关注代码质量与长期可维护性，习惯用清晰的设计解决复杂问题",
    "具备良好的跨团队沟通能力，能够推动方案从讨论走向落地",
    "保持持续学习，乐于沉淀工具、文档与工程实践",
  ],
};

export const defaultStyle: ResumeStyle = {
  accent: "#2d8c87",
  density: "comfortable",
};
