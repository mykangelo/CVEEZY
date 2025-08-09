export interface Resume {

  id: number;
  name: string;
  creation_date: string;
  updated_at: string;
  status: 'draft' | 'completed' | 'published';
  template_id?: number;
  user_id: number;
}

export interface ResumeData {
  contact: {
    firstName: string;
    lastName: string;
    desiredJobTitle: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
    postCode?: string;
    websites?: string[];
  };
  experiences: Array<{
    id: number;
    jobTitle: string;
    employer: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    current?: boolean;
  }>;
  educations: Array<{
    id: number;
    school: string;
    degree: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: Array<{
    id: number;
    name: string;
    level: 'Beginner' | 'Novice' | 'Skillful' | 'Experienced' | 'Expert';
  }>;
  summary: string;

  languages: Array<{
    id: number;
    content: string;
    level: "Elementary" | "Intermediate" | "Proficient" | "Advanced" | "Native" ;
  }>;
  certifications: Array<{
    id: number;
    content: string;
  }>;
  awards: Array<{
    id: number;
    content: string;
  }>;
  websites: Array<{ id: number; title: string; url: string; content?: string }>;
  showReferences: Array<{
    id: number;
    content: string;
  }>;
  hobbies: Array<{
    id: number;
    content: string;
  }>;
  customSections: Array<{
    id: number;
    sectionName: string;
    description: string;
  }>;
}


export interface DashboardProps {
  resumes: Resume[];
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
