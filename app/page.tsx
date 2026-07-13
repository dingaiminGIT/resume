import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Rss,
  Star,
  UserRound,
  Wrench,
} from "lucide-react";
import resume from "../resume.json";
import { ResumeActions } from "./components/ResumeActions";
import { RichText } from "./components/RichText";

type Icon = typeof BriefcaseBusiness;

function ContactItem({ icon: Icon, children, href }: { icon: Icon; children: React.ReactNode; href?: string }) {
  const content = (
    <>
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </>
  );
  return href ? <a href={href}>{content}</a> : <span>{content}</span>;
}

function SectionHeading({ icon: Icon, title, subtitle }: { icon: Icon; title: string; subtitle: string }) {
  return (
    <header className="section-heading">
      <span className="section-icon"><Icon aria-hidden="true" /></span>
      <span>
        <h2>{title}</h2>
        <small>{subtitle}</small>
      </span>
    </header>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="bullet-list">
      {items.map((item) => (
        <li key={item}>
          <Star aria-hidden="true" />
          <span><RichText text={item} /></span>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const backend = resume.skills.find((skill) => skill.type === "backend");
  const misc = resume.skills.find((skill) => skill.type === "miscellaneous");
  const backendItems = backend?.item.flatMap((item) =>
    typeof item === "string" ? [item] : item.description,
  ) ?? [];
  const miscItems = misc?.item.filter((item): item is string => typeof item === "string") ?? [];
  const evaluationItems = resume.evaluation.flatMap((item) =>
    item.item.flatMap((entry) => entry.description),
  );

  return (
    <main className="canvas">
      <article className="resume-sheet">
        <header className="hero">
          <div className="identity-mark" aria-hidden="true">DA</div>
          <address className="contact-list">
            <ContactItem icon={Phone} href={`tel:${resume.contact.phone.replace(/-/g, "")}`}>
              {resume.contact.phone}
            </ContactItem>
            <ContactItem icon={Mail} href={`mailto:${resume.contact.email}`}>
              {resume.contact.email}
            </ContactItem>
            <ContactItem icon={MessageCircle}>{resume.contact.wechat.id}</ContactItem>
            <ContactItem icon={Rss} href={resume.contact.blog.url}>
              {resume.contact.blog.url.replace(/^https?:\/\//, "")}
            </ContactItem>
            <ContactItem icon={MapPin}>{resume.contact.localtion}</ContactItem>
          </address>
          <div className="name-block">
            <h1>{resume.name}</h1>
            <p>{resume.job_description.join(" / ")}</p>
          </div>
          <ResumeActions />
        </header>

        <div className="resume-body">
          <section className="timeline-section experience-section">
            <SectionHeading icon={BriefcaseBusiness} title="工作经历" subtitle="EXPERIENCE" />
            <div className="timeline">
              {resume.experience.map((item) => (
                <article className="timeline-entry" key={`${item.place}-${item.start}`}>
                  <span className="timeline-node"><BookOpen aria-hidden="true" /></span>
                  <header className="entry-bar">
                    <h3>{item.place}</h3>
                    <time>{item.start} ~ {item.end}</time>
                  </header>
                  <h4>{item.name}</h4>
                  <ul className="detail-list">
                    {item.description.map((description) => (
                      <li key={description}><RichText text={description} /></li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="timeline-section">
            <SectionHeading icon={Wrench} title="专业技能" subtitle="PROGRAMMING SKILLS" />
            <div className="timeline compact-timeline">
              <article className="timeline-entry">
                <span className="timeline-node"><Wrench aria-hidden="true" /></span>
                <header className="entry-bar"><h3>Java 服务端</h3></header>
                <BulletList items={backendItems} />
              </article>
              <article className="timeline-entry">
                <span className="timeline-node"><Wrench aria-hidden="true" /></span>
                <header className="entry-bar"><h3>其他</h3></header>
                <BulletList items={miscItems} />
              </article>
            </div>
          </section>

          <section className="timeline-section">
            <SectionHeading icon={GraduationCap} title="教育经历" subtitle="EDUCATION" />
            <div className="timeline compact-timeline">
              {resume.education.map((education) => (
                <article className="timeline-entry" key={education.university}>
                  <span className="timeline-node"><GraduationCap aria-hidden="true" /></span>
                  <header className="entry-bar"><h3>{education.university}</h3></header>
                  <BulletList items={education.info.map((info) => `${info.start} ~ ${info.end} ${info.major}（全日制本科）`)} />
                </article>
              ))}
            </div>
          </section>

          <section className="timeline-section evaluation-section">
            <SectionHeading icon={UserRound} title="自我评价" subtitle="SELF EVALUATION" />
            <div className="timeline compact-timeline">
              <article className="timeline-entry">
                <span className="timeline-node"><UserRound aria-hidden="true" /></span>
                <BulletList items={evaluationItems} />
              </article>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
