export type Experience = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  highlights: string[];
  technologies: string;
};

export type SkillGroup = {
  id: string;
  name: string;
  items: string;
};

export type Education = {
  id: string;
  school: string;
  major: string;
  start: string;
  end: string;
};

export type ResumeData = {
  version: 1;
  profile: {
    name: string;
    title: string;
    phone: string;
    email: string;
    location: string;
    website: string;
  };
  experience: Experience[];
  skills: SkillGroup[];
  education: Education[];
  evaluation: string[];
};

export type ResumeStyle = {
  accent: string;
  density: "comfortable" | "compact";
};

export const STORAGE_KEY = "resume-workshop:v1";

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isResumeData(value: unknown): value is ResumeData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ResumeData>;
  return (
    candidate.version === 1 &&
    !!candidate.profile &&
    typeof candidate.profile.name === "string" &&
    Array.isArray(candidate.experience) &&
    Array.isArray(candidate.skills) &&
    Array.isArray(candidate.education) &&
    Array.isArray(candidate.evaluation)
  );
}
