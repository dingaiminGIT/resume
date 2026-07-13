"use client";

import BriefcaseBusiness from "lucide-react/dist/esm/icons/briefcase-business";
import Check from "lucide-react/dist/esm/icons/check";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Download from "lucide-react/dist/esm/icons/download";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Monitor from "lucide-react/dist/esm/icons/monitor";
import Palette from "lucide-react/dist/esm/icons/palette";
import Plus from "lucide-react/dist/esm/icons/plus";
import Printer from "lucide-react/dist/esm/icons/printer";
import QrCode from "lucide-react/dist/esm/icons/qr-code";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Rows3 from "lucide-react/dist/esm/icons/rows-3";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Upload from "lucide-react/dist/esm/icons/upload";
import UserRound from "lucide-react/dist/esm/icons/user-round";
import Wrench from "lucide-react/dist/esm/icons/wrench";
import {
  type ChangeEvent,
  type ComponentType,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { defaultStyle, sampleResume } from "../lib/sample-resume";
import {
  createId,
  isResumeData,
  STORAGE_KEY,
  type Education,
  type Experience,
  type ResumeData,
  type ResumeStyle,
  type SkillGroup,
} from "../lib/resume";
import { ResumePreview } from "./ResumePreview";

type SectionId = "profile" | "experience" | "skills" | "education" | "evaluation";
type PanelTab = "content" | "style";
type MobileView = "editor" | "preview";

type SectionDefinition = {
  id: SectionId;
  label: string;
  icon: ComponentType<{ "aria-hidden"?: boolean }>;
};

type StoredPayload = {
  data: ResumeData;
  style: ResumeStyle;
};

const SECTION_DEFINITIONS: SectionDefinition[] = [
  { id: "profile", label: "基本信息", icon: UserRound },
  { id: "experience", label: "工作经历", icon: BriefcaseBusiness },
  { id: "skills", label: "专业技能", icon: Wrench },
  { id: "education", label: "教育经历", icon: GraduationCap },
  { id: "evaluation", label: "自我评价", icon: UserRound },
];

const ACCENTS = ["#2d8c87", "#3b6ea8", "#7c5b9e", "#a85c45"];
const MAX_QR_SIDE = 420;
const QR_CROP_VERSION = 2;

type CropBox = { x: number; y: number; width: number; height: number };
type BarcodeDetectorInstance = { detect: (source: HTMLCanvasElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> };
type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance;

function squareCrop(box: CropBox, imageWidth: number, imageHeight: number, paddingRatio = 0.05): CropBox {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const side = Math.min(Math.max(box.width, box.height) * (1 + paddingRatio * 2), imageWidth, imageHeight);
  return {
    x: Math.max(0, Math.min(imageWidth - side, centerX - side / 2)),
    y: Math.max(0, Math.min(imageHeight - side, centerY - side / 2)),
    width: side,
    height: side,
  };
}

async function detectQrCrop(image: HTMLImageElement): Promise<CropBox | null> {
  const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  if (Detector) {
    try {
      const [result] = await new Detector({ formats: ["qr_code"] }).detect(canvas);
      if (result) {
        return squareCrop({
          x: result.boundingBox.x / scale,
          y: result.boundingBox.y / scale,
          width: result.boundingBox.width / scale,
          height: result.boundingBox.height / scale,
        }, image.naturalWidth, image.naturalHeight);
      }
    } catch {
      // Continue with the cross-browser decoder below.
    }
  }

  try {
    const { default: jsQR } = await import("jsqr");
    const code = jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, {
      inversionAttempts: "attemptBoth",
    });
    if (!code) return null;
    const corners = [
      code.location.topLeftCorner,
      code.location.topRightCorner,
      code.location.bottomLeftCorner,
      code.location.bottomRightCorner,
    ];
    const minX = Math.min(...corners.map((point) => point.x));
    const minY = Math.min(...corners.map((point) => point.y));
    const maxX = Math.max(...corners.map((point) => point.x));
    const maxY = Math.max(...corners.map((point) => point.y));
    return squareCrop({
      x: minX / scale,
      y: minY / scale,
      width: (maxX - minX) / scale,
      height: (maxY - minY) / scale,
    }, image.naturalWidth, image.naturalHeight);
  } catch {
    return null;
  }
}

function centeredFallbackCrop(image: HTMLImageElement): CropBox {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const ratio = width / height;
  const side = ratio > 0.86 && ratio < 1.14 ? Math.min(width, height) : Math.min(width, height) * 0.72;
  return { x: (width - side) / 2, y: (height - side) / 2, width: side, height: side };
}

async function prepareQrImage(file: Blob) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("format");
  }
  if (file.size > 8 * 1024 * 1024) throw new Error("size");

  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new window.Image();
      candidate.onload = () => resolve(candidate);
      candidate.onerror = () => reject(new Error("decode"));
      candidate.src = source;
    });
    const detectedCrop = await detectQrCrop(image);
    const crop = detectedCrop ?? centeredFallbackCrop(image);
    const canvas = document.createElement("canvas");
    canvas.width = MAX_QR_SIDE;
    canvas.height = MAX_QR_SIDE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    const outputPadding = 4;
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      outputPadding,
      outputPadding,
      canvas.width - outputPadding * 2,
      canvas.height - outputPadding * 2,
    );
    const result = canvas.toDataURL("image/png");
    if (result.length > 1_500_000) throw new Error("size");
    return { dataUrl: result, detected: Boolean(detectedCrop) };
  } finally {
    URL.revokeObjectURL(source);
  }
}

function cloneSample() {
  return structuredClone(sampleResume);
}

function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function TextArea({ label, hint, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <label className="form-field form-field-textarea">
      <span>{label}</span>
      {hint ? <small>{hint}</small> : null}
      <textarea {...props} />
    </label>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <header className="editor-section-title">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

export function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(cloneSample);
  const [style, setStyle] = useState<ResumeStyle>(defaultStyle);
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [panelTab, setPanelTab] = useState<PanelTab>("content");
  const [mobileView, setMobileView] = useState<MobileView>("editor");
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const migratedQrRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredPayload;
          if (isResumeData(parsed.data)) {
            setData(parsed.data);
            setStyle(parsed.style ?? defaultStyle);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, style } satisfies StoredPayload));
      } catch {
        setMessage("本地存储空间不足，请更换更小的二维码图片");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [data, hydrated, style]);

  useEffect(() => {
    const savedQr = data.profile.wechatQr;
    if (
      !hydrated
      || migratedQrRef.current
      || !savedQr?.startsWith("data:image/")
      || data.profile.wechatQrCropVersion === QR_CROP_VERSION
    ) return;
    migratedQrRef.current = true;
    let cancelled = false;
    void fetch(savedQr)
      .then((response) => response.blob())
      .then(prepareQrImage)
      .then(({ dataUrl }) => {
        if (cancelled) return;
        setData((current) => current.profile.wechatQr === savedQr ? {
          ...current,
          profile: { ...current.profile, wechatQr: dataUrl, wechatQrCropVersion: QR_CROP_VERSION },
        } : current);
        setMessage("已自动收紧原有二维码留白");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [data.profile.wechatQr, data.profile.wechatQrCropVersion, hydrated]);

  function updateProfile(field: keyof ResumeData["profile"], value: string) {
    setData((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  }

  function updateExperience(id: string, patch: Partial<Experience>) {
    setData((current) => ({
      ...current,
      experience: current.experience.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  }

  function addExperience() {
    setData((current) => ({
      ...current,
      experience: [
        ...current.experience,
        { id: createId("exp"), company: "", role: "", start: "", end: "", highlights: [""], technologies: "" },
      ],
    }));
  }

  function removeExperience(id: string) {
    setData((current) => ({ ...current, experience: current.experience.filter((item) => item.id !== id) }));
  }

  function updateSkill(id: string, patch: Partial<SkillGroup>) {
    setData((current) => ({
      ...current,
      skills: current.skills.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  }

  function addSkill() {
    setData((current) => ({
      ...current,
      skills: [...current.skills, { id: createId("skill"), name: "", items: "" }],
    }));
  }

  function removeSkill(id: string) {
    setData((current) => ({ ...current, skills: current.skills.filter((item) => item.id !== id) }));
  }

  function updateEducation(id: string, patch: Partial<Education>) {
    setData((current) => ({
      ...current,
      education: current.education.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  }

  function addEducation() {
    setData((current) => ({
      ...current,
      education: [...current.education, { id: createId("edu"), school: "", major: "", start: "", end: "" }],
    }));
  }

  function removeEducation(id: string) {
    setData((current) => ({ ...current, education: current.education.filter((item) => item.id !== id) }));
  }

  function goToNextSection() {
    const index = SECTION_DEFINITIONS.findIndex((section) => section.id === activeSection);
    const next = SECTION_DEFINITIONS[Math.min(index + 1, SECTION_DEFINITIONS.length - 1)];
    setActiveSection(next.id);
  }

  function exportJson() {
    const payload = JSON.stringify({ data, style } satisfies StoredPayload, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${data.profile.name || "resume"}-简历.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("简历数据已导出");
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as StoredPayload | ResumeData;
      const importedData = "data" in parsed ? parsed.data : parsed;
      if (!isResumeData(importedData)) throw new Error("invalid");
      setData(importedData);
      if ("style" in parsed && parsed.style) setStyle(parsed.style);
      setMessage("导入成功，预览已更新");
    } catch {
      setMessage("导入失败，请选择由履历工坊导出的 JSON 文件");
    } finally {
      event.target.value = "";
    }
  }

  async function uploadWechatQr(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, detected } = await prepareQrImage(file);
      setData((current) => ({
        ...current,
        profile: { ...current.profile, wechatQr: dataUrl, wechatQrCropVersion: QR_CROP_VERSION },
      }));
      setMessage(detected ? "已自动识别并裁剪二维码" : "已自动居中裁剪，请确认二维码完整");
    } catch {
      setMessage("二维码处理失败，请选择 8MB 以内的 PNG、JPG 或 WebP 图片");
    } finally {
      event.target.value = "";
    }
  }

  function resetResume() {
    if (!window.confirm("确定恢复示例数据吗？当前编辑内容会被覆盖。")) return;
    setData(cloneSample());
    setStyle(defaultStyle);
    setMessage("已恢复示例数据");
  }

  return (
    <main className="builder-shell">
      <header className="app-bar">
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">历</span>
          <strong>履历工坊</strong>
          <span className="save-state"><Check aria-hidden="true" />已自动保存</span>
        </div>
        <nav className="app-actions" aria-label="文件与导出">
          <input ref={importRef} className="visually-hidden" type="file" accept="application/json" onChange={importJson} />
          <button type="button" onClick={() => importRef.current?.click()}><Upload aria-hidden="true" />导入</button>
          <button type="button" onClick={exportJson}><Download aria-hidden="true" />导出</button>
          <button type="button" className="primary-action" onClick={() => window.print()}><Printer aria-hidden="true" />打印 / PDF</button>
        </nav>
      </header>

      <div className="mobile-view-switch" aria-label="移动端视图">
        <button type="button" className={mobileView === "editor" ? "active" : ""} onClick={() => setMobileView("editor")}>编辑</button>
        <button type="button" className={mobileView === "preview" ? "active" : ""} onClick={() => setMobileView("preview")}>预览</button>
      </div>

      <div className="builder-workspace">
        <aside className={`editor-rail ${mobileView === "editor" ? "mobile-active" : ""}`} aria-label="简历章节">
          {SECTION_DEFINITIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={activeSection === id && panelTab === "content" ? "active" : ""}
              onClick={() => { setPanelTab("content"); setActiveSection(id); }}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
          <button type="button" className={panelTab === "style" ? "active" : ""} onClick={() => setPanelTab("style")}>
            <Palette aria-hidden="true" />
            <span>样式设置</span>
          </button>
        </aside>

        <section className={`editor-panel ${mobileView === "editor" ? "mobile-active" : ""}`} aria-label="简历内容编辑器">
          <div className="panel-tabs" role="tablist" aria-label="编辑类型">
            <button type="button" role="tab" aria-selected={panelTab === "content"} className={panelTab === "content" ? "active" : ""} onClick={() => setPanelTab("content")}>内容</button>
            <button type="button" role="tab" aria-selected={panelTab === "style"} className={panelTab === "style" ? "active" : ""} onClick={() => setPanelTab("style")}>样式</button>
          </div>

          <div className="editor-scroll">
            {panelTab === "style" ? (
              <StyleEditor style={style} onChange={setStyle} onReset={resetResume} />
            ) : null}
            {panelTab === "content" && activeSection === "profile" ? (
              <>
                <SectionTitle title="基本信息" description="这些信息会显示在简历页眉中。" />
                <div className="form-grid">
                  <Field label="姓名" value={data.profile.name} onChange={(event) => updateProfile("name", event.target.value)} />
                  <Field label="职位" value={data.profile.title} onChange={(event) => updateProfile("title", event.target.value)} />
                  <Field label="手机" value={data.profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} />
                  <Field label="邮箱" type="email" value={data.profile.email} onChange={(event) => updateProfile("email", event.target.value)} />
                  <Field label="所在地" value={data.profile.location} onChange={(event) => updateProfile("location", event.target.value)} />
                  <Field label="个人网站" value={data.profile.website} onChange={(event) => updateProfile("website", event.target.value)} />
                  <Field label="微信号" value={data.profile.wechatId ?? ""} onChange={(event) => updateProfile("wechatId", event.target.value)} />
                  <div className="qr-field">
                    <span>微信二维码</span>
                    <div className="qr-upload-row">
                      {data.profile.wechatQr ? (
                        // eslint-disable-next-line @next/next/no-img-element -- The user-selected local data URL is already resized client-side.
                        <img className="qr-upload-preview" src={data.profile.wechatQr} alt="已选择的微信二维码" />
                      ) : (
                        <span className="qr-upload-placeholder"><QrCode aria-hidden="true" /></span>
                      )}
                      <div className="qr-upload-actions">
                        <label className="qr-upload-button">
                          <Upload aria-hidden="true" />
                          {data.profile.wechatQr ? "更换二维码" : "上传微信二维码"}
                          <input className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadWechatQr} />
                        </label>
                        {data.profile.wechatQr ? (
                          <button
                            type="button"
                            className="qr-remove-button"
                            onClick={() => setData((current) => ({
                              ...current,
                              profile: { ...current.profile, wechatQr: "", wechatQrCropVersion: QR_CROP_VERSION },
                            }))}
                          >
                            <Trash2 aria-hidden="true" />删除二维码
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <small>上传后会自动识别并裁剪二维码；图片仅保存在当前浏览器中。</small>
                  </div>
                </div>
              </>
            ) : null}
            {panelTab === "content" && activeSection === "experience" ? (
              <>
                <SectionTitle title="工作经历" description="用具体动作与结果描述你的贡献，一行一个要点。" />
                <div className="editor-item-list">
                  {data.experience.map((experience, index) => (
                    <article className="editor-item" key={experience.id}>
                      <header><strong>经历 {index + 1}</strong><button type="button" onClick={() => removeExperience(experience.id)} aria-label={`删除经历 ${index + 1}`}><Trash2 aria-hidden="true" />删除</button></header>
                      <div className="form-grid two-columns">
                        <Field label="公司名称" value={experience.company} onChange={(event) => updateExperience(experience.id, { company: event.target.value })} />
                        <Field label="职位" value={experience.role} onChange={(event) => updateExperience(experience.id, { role: event.target.value })} />
                        <Field label="开始时间" value={experience.start} onChange={(event) => updateExperience(experience.id, { start: event.target.value })} />
                        <Field label="结束时间" value={experience.end} onChange={(event) => updateExperience(experience.id, { end: event.target.value })} />
                      </div>
                      <TextArea label="工作要点" hint="每行一个要点" rows={5} value={experience.highlights.join("\n")} onChange={(event) => updateExperience(experience.id, { highlights: event.target.value.split("\n") })} />
                      <Field label="主要技术" value={experience.technologies} onChange={(event) => updateExperience(experience.id, { technologies: event.target.value })} />
                    </article>
                  ))}
                </div>
                <button type="button" className="add-item-button" onClick={addExperience}><Plus aria-hidden="true" />添加工作经历</button>
              </>
            ) : null}
            {panelTab === "content" && activeSection === "skills" ? (
              <>
                <SectionTitle title="专业技能" description="按类别组织技能，使用顿号或逗号分隔。" />
                <div className="editor-item-list">
                  {data.skills.map((skill, index) => (
                    <article className="editor-item compact" key={skill.id}>
                      <header><strong>技能组 {index + 1}</strong><button type="button" onClick={() => removeSkill(skill.id)} aria-label={`删除技能组 ${index + 1}`}><Trash2 aria-hidden="true" />删除</button></header>
                      <Field label="分类名称" value={skill.name} onChange={(event) => updateSkill(skill.id, { name: event.target.value })} />
                      <TextArea label="技能列表" rows={3} value={skill.items} onChange={(event) => updateSkill(skill.id, { items: event.target.value })} />
                    </article>
                  ))}
                </div>
                <button type="button" className="add-item-button" onClick={addSkill}><Plus aria-hidden="true" />添加技能组</button>
              </>
            ) : null}
            {panelTab === "content" && activeSection === "education" ? (
              <>
                <SectionTitle title="教育经历" description="填写学校、专业和就读时间。" />
                <div className="editor-item-list">
                  {data.education.map((education, index) => (
                    <article className="editor-item" key={education.id}>
                      <header><strong>教育经历 {index + 1}</strong><button type="button" onClick={() => removeEducation(education.id)} aria-label={`删除教育经历 ${index + 1}`}><Trash2 aria-hidden="true" />删除</button></header>
                      <div className="form-grid two-columns">
                        <Field label="学校" value={education.school} onChange={(event) => updateEducation(education.id, { school: event.target.value })} />
                        <Field label="专业与学历" value={education.major} onChange={(event) => updateEducation(education.id, { major: event.target.value })} />
                        <Field label="开始时间" value={education.start} onChange={(event) => updateEducation(education.id, { start: event.target.value })} />
                        <Field label="结束时间" value={education.end} onChange={(event) => updateEducation(education.id, { end: event.target.value })} />
                      </div>
                    </article>
                  ))}
                </div>
                <button type="button" className="add-item-button" onClick={addEducation}><Plus aria-hidden="true" />添加教育经历</button>
              </>
            ) : null}
            {panelTab === "content" && activeSection === "evaluation" ? (
              <>
                <SectionTitle title="自我评价" description="保持简洁真实，每行表达一个特点。" />
                <TextArea label="评价内容" hint="每行一个要点" rows={10} value={data.evaluation.join("\n")} onChange={(event) => setData((current) => ({ ...current, evaluation: event.target.value.split("\n") }))} />
              </>
            ) : null}

            {panelTab === "content" ? (
              <button type="button" className="next-section-button" onClick={goToNextSection}>
                下一步：{SECTION_DEFINITIONS[Math.min(SECTION_DEFINITIONS.findIndex((section) => section.id === activeSection) + 1, SECTION_DEFINITIONS.length - 1)].label}
                <ChevronRight aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </section>

        <section className={`preview-panel ${mobileView === "preview" ? "mobile-active" : ""}`} aria-label="简历预览区">
          <div className="preview-toolbar">
            <span><Monitor aria-hidden="true" />桌面预览</span>
            <button type="button" onClick={() => setStyle((current) => ({ ...current, density: current.density === "compact" ? "comfortable" : "compact" }))}>
              <Rows3 aria-hidden="true" />{style.density === "compact" ? "舒展" : "紧凑"}
            </button>
            <span className="toolbar-accent"><span style={{ background: style.accent }} />主题色</span>
          </div>
          <div className="preview-scroll"><ResumePreview data={data} style={style} /></div>
        </section>
      </div>
      <p className="status-message" aria-live="polite">{message}</p>
    </main>
  );
}

function StyleEditor({ style, onChange, onReset }: { style: ResumeStyle; onChange: (style: ResumeStyle) => void; onReset: () => void }) {
  return (
    <>
      <SectionTitle title="样式设置" description="调整主题色和信息密度，预览会立即更新。" />
      <section className="style-group">
        <h3>主题色</h3>
        <div className="accent-options">
          {ACCENTS.map((accent) => (
            <button
              key={accent}
              type="button"
              aria-label={`选择主题色 ${accent}`}
              aria-pressed={style.accent === accent}
              className={style.accent === accent ? "active" : ""}
              style={{ background: accent }}
              onClick={() => onChange({ ...style, accent })}
            />
          ))}
        </div>
      </section>
      <section className="style-group">
        <h3>内容密度</h3>
        <div className="density-options">
          <button type="button" className={style.density === "comfortable" ? "active" : ""} onClick={() => onChange({ ...style, density: "comfortable" })}>舒展</button>
          <button type="button" className={style.density === "compact" ? "active" : ""} onClick={() => onChange({ ...style, density: "compact" })}>紧凑</button>
        </div>
      </section>
      <button type="button" className="reset-button" onClick={onReset}><RotateCcw aria-hidden="true" />恢复示例数据</button>
    </>
  );
}
