import BookOpen from "lucide-react/dist/esm/icons/book-open";
import BriefcaseBusiness from "lucide-react/dist/esm/icons/briefcase-business";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Globe from "lucide-react/dist/esm/icons/globe";
import Mail from "lucide-react/dist/esm/icons/mail";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Phone from "lucide-react/dist/esm/icons/phone";
import Star from "lucide-react/dist/esm/icons/star";
import UserRound from "lucide-react/dist/esm/icons/user-round";
import Wrench from "lucide-react/dist/esm/icons/wrench";
import type { CSSProperties, ReactNode } from "react";
import type { ResumeData, ResumeStyle } from "../lib/resume";

type Icon = typeof BriefcaseBusiness;

function Contact({ icon: Icon, children }: { icon: Icon; children: ReactNode }) {
  return (
    <span>
      <Icon aria-hidden="true" />
      <span>{children || "未填写"}</span>
    </span>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }: { icon: Icon; title: string; subtitle: string }) {
  return (
    <header className="preview-section-heading">
      <span className="preview-section-icon"><Icon aria-hidden="true" /></span>
      <span>
        <h2>{title}</h2>
        <small>{subtitle}</small>
      </span>
    </header>
  );
}

function StarList({ items }: { items: string[] }) {
  return (
    <ul className="preview-star-list">
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>
          <Star aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ResumePreview({ data, style }: { data: ResumeData; style: ResumeStyle }) {
  const initials = data.profile.name.trim().slice(0, 2).toUpperCase() || "CV";
  const qrImage = data.profile.wechatQr?.startsWith("data:image/") || data.profile.wechatQr?.startsWith("/")
    ? data.profile.wechatQr
    : "";
  const variables = { "--accent": style.accent } as CSSProperties;

  return (
    <article className="resume-preview" data-density={style.density} style={variables} aria-label="简历实时预览">
      <header className="preview-hero">
        {qrImage ? (
          <figure className="preview-qr-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element -- The local QR data URL is pre-sized before it reaches the preview. */}
            <img className="preview-qr" src={qrImage} alt="微信二维码" />
            <figcaption>微信扫码</figcaption>
          </figure>
        ) : (
          <div className="preview-mark" aria-hidden="true">{initials}</div>
        )}
        <address className="preview-contact">
          <Contact icon={Phone}>{data.profile.phone}</Contact>
          <Contact icon={Mail}>{data.profile.email}</Contact>
          <Contact icon={MapPin}>{data.profile.location}</Contact>
          <Contact icon={Globe}>{data.profile.website}</Contact>
          {data.profile.wechatId ? <Contact icon={MessageCircle}>{data.profile.wechatId}</Contact> : null}
        </address>
        <div className="preview-name">
          <h1>{data.profile.name || "你的姓名"}</h1>
          <p>{data.profile.title || "目标职位"}</p>
        </div>
      </header>

      <div className="preview-body">
        {data.experience.length > 0 ? (
          <section className="preview-section">
            <SectionHeading icon={BriefcaseBusiness} title="工作经历" subtitle="EXPERIENCE" />
            <div className="preview-timeline">
              {data.experience.map((experience) => (
                <article className="preview-entry" key={experience.id}>
                  <span className="preview-node"><BookOpen aria-hidden="true" /></span>
                  <header className="preview-entry-bar">
                    <h3>{experience.company || "公司名称"} · {experience.role || "职位"}</h3>
                    <time>{experience.start || "开始时间"} ~ {experience.end || "结束时间"}</time>
                  </header>
                  <ul className="preview-detail-list">
                    {experience.highlights.filter(Boolean).map((highlight, index) => (
                      <li key={`${experience.id}-${index}`}>{highlight}</li>
                    ))}
                    {experience.technologies ? (
                      <li><strong>主要技术：</strong>{experience.technologies}</li>
                    ) : null}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.skills.length > 0 ? (
          <section className="preview-section">
            <SectionHeading icon={Wrench} title="专业技能" subtitle="SKILLS" />
            <div className="preview-timeline preview-compact-timeline">
              {data.skills.map((skill) => (
                <article className="preview-entry" key={skill.id}>
                  <span className="preview-node"><Wrench aria-hidden="true" /></span>
                  <header className="preview-entry-bar"><h3>{skill.name || "技能分类"}</h3></header>
                  <StarList items={skill.items.split(/[、,，]/).map((item) => item.trim()).filter(Boolean)} />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.education.length > 0 ? (
          <section className="preview-section">
            <SectionHeading icon={GraduationCap} title="教育经历" subtitle="EDUCATION" />
            <div className="preview-timeline preview-compact-timeline">
              {data.education.map((education) => (
                <article className="preview-entry" key={education.id}>
                  <span className="preview-node"><GraduationCap aria-hidden="true" /></span>
                  <header className="preview-entry-bar"><h3>{education.school || "学校名称"}</h3></header>
                  <StarList items={[`${education.start} ~ ${education.end} ${education.major}`.trim()]} />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.evaluation.some(Boolean) ? (
          <section className="preview-section">
            <SectionHeading icon={UserRound} title="自我评价" subtitle="SELF EVALUATION" />
            <div className="preview-timeline preview-compact-timeline">
              <article className="preview-entry">
                <span className="preview-node"><UserRound aria-hidden="true" /></span>
                <StarList items={data.evaluation.filter(Boolean)} />
              </article>
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
