import { ChangelogItem } from './types';

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    version: 'v1.2.0',
    date: 'October 2026',
    title: '5-Unit Notes Reader & Performance Engine',
    badge: 'Latest',
    changes: [
      'Added in-app PDF and markdown reader for seamless document viewing without forced downloads.',
      'Organized all 16 Semester III subjects with dedicated Unit 1 to Unit 5 categorized tabs.',
      'Offline-first PWA caching with background synchronization and zero-latency local fallback.',
      'Introduced copyright reporting system and user privacy controls (data export and clearing).',
      'Refined live class timetable progress tracker with minute-by-minute countdown.'
    ],
  },
  {
    version: 'v1.1.0',
    date: 'September 2026',
    title: 'ABES Curriculum Expansion',
    changes: [
      'Added complete syllabus coverage for CSE, CSE (AI & ML), and CSE (Data Science) departments.',
      'Added lab sessions with Group 1 / Group 2 distinction and assigned laboratory rooms.',
      'Optimized Cloudflare R2 object storage integration with secure presigned viewing URLs.'
    ],
  },
  {
    version: 'v1.0.0',
    date: 'August 2026',
    title: 'Initial Release',
    changes: [
      'Launched Clasy web application with real-time timetable tracking.',
      'Admin dashboard for real-time timetable and notes management.',
      'Mobile-first responsive Apple-inspired design system.'
    ],
  },
];
