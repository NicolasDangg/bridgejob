export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  logo?: string;
  postedAt: string;
  keywords?: string[];
  source: 'Google' | 'Meta' | 'TikTok' | 'Other';
}

const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    salary: '$160,000 - $240,000',
    description: 'We are looking for a Senior Frontend Engineer to lead our next-generation consumer applications using React and TypeScript.',
    url: 'https://careers.google.com',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
    postedAt: '2 days ago',
    source: 'Google',
    keywords: ['tech', 'frontend', 'react', 'typescript', 'web']
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer, Reality Labs',
    company: 'Meta',
    location: 'Menlo Park, CA',
    salary: '$180,000 - $265,000',
    description: 'Join the team building the future of the metaverse. Strong experience with Node.js and modern frontend frameworks required.',
    url: 'https://metacareers.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/200px-Meta_Platforms_Inc._logo.svg.png',
    postedAt: '1 week ago',
    source: 'Meta',
    keywords: ['tech', 'full stack', 'node.js', 'frontend', 'metaverse']
  },
  {
    id: 'job-3',
    title: 'Backend Engineer - Recommendations',
    company: 'TikTok',
    location: 'San Jose, CA',
    salary: '$155,000 - $230,000',
    description: 'Scale our recommendation engine to serve billions of users. Expertise in Go or Java and high-concurrency systems is a must.',
    url: 'https://careers.tiktok.com',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/200px-TikTok_logo.svg.png',
    postedAt: '3 days ago',
    source: 'TikTok',
    keywords: ['tech', 'backend', 'go', 'java', 'systems']
  },
  {
    id: 'job-4',
    title: 'Software Engineer III',
    company: 'Amazon',
    location: 'Seattle, WA',
    salary: '$140,000 - $210,000',
    description: 'AWS is seeking talented software engineers to build the next generation of cloud computing services.',
    url: 'https://amazon.jobs',
    postedAt: '5 days ago',
    source: 'Other',
    keywords: ['tech', 'cloud', 'aws', 'distributed systems']
  }
];

export async function searchJobs(query: string, company?: string): Promise<Job[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let filtered = [...MOCK_JOBS];
  
  const normalizedQuery = query.trim().toLowerCase();
  
  if (normalizedQuery) {
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    filtered = filtered.filter(job => {
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.description,
        job.source,
        ...(job.keywords ?? []),
      ].join(' ').toLowerCase();

      return terms.every((term) => searchableText.includes(term));
    });
  }
  
  if (company && company !== 'All') {
    filtered = filtered.filter(j => j.company === company);
  }
  
  return filtered;
}
