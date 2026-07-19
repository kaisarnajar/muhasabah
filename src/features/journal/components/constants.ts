import { JournalCategory } from '@prisma/client';

export const CATEGORY_LABELS: Record<JournalCategory, string> = {
  OFFICE: 'Office Work',
  LEARNING: 'Career Learnings',
  MISC: 'Miscellaneous',
};

export const WORK_TYPES = [
  'Feature',
  'Bug Fix',
  'Refactor',
  'Meeting',
  'Deployment',
  'Support',
  'Other'
];

export const MISC_ACTIVITIES = [
  'Projects',
  'Movies & Shows',
  'Courses & Education',
  'Self Improvement',
  'Travel',
  'Food',
  'Social',
  'Shopping',
  'Health',
  'Thoughts',
  'Entertainment',
  'Family',
  'Spiritual',
  'Finance',
  'Hobby',
  'Other'
];

export const PREDEFINED_TOPICS = [
  // Mobile
  'Android Development',
  'iOS Development',
  'React Native',
  'Flutter',
  // Web
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Next.js',
  'React',
  'Node.js',
  'TypeScript',
  // Languages
  'Java',
  'Kotlin',
  'Python',
  'C++',
  'C#',
  'Go',
  'Rust',
  // CS Fundamentals
  'DSA',
  'System Design',
  'Computer Networks',
  'Operating Systems',
  'Database / SQL',
  // AI / ML
  'Machine Learning',
  'Deep Learning',
  'AI & ML',
  'AI Engineering',
  'LLMs & Prompt Engineering',
  // DevOps & Cloud
  'DevOps',
  'Docker & Kubernetes',
  'Cloud (AWS / GCP / Azure)',
  'CI/CD',
  // Other
  'Cybersecurity',
  'Blockchain',
  'Open Source',
  'Competitive Programming',
  'Soft Skills',
];
