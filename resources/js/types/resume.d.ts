export interface Resume {
    id: number;
    name: string;
    creation_date: string;
    updated_at: string;
    status: 'draft' | 'in_progress' | 'completed' | 'published';
    template_id?: number;
    template_name?: string;
    user_id: number;
    payment_status?: 'pending' | 'approved' | 'rejected' | 'needs_payment' | 'needs_payment_modified' | null;
    is_paid?: boolean;
    needs_payment?: boolean;
    is_downloadable?: boolean;
    can_be_edited?: boolean;
    payment_status_detailed?: string;
    last_paid_at?: string;
    last_modified_at?: string;
}

export type Contact = {
  firstName: string;
  lastName: string;
  desiredJobTitle: string;
  phone: string;
  email: string;
  country?: string;
  city?: string;
  address?: string;
  postCode?: string;
};

export type Experience = {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
};

export type Education = {
  id: number;
  school: string;
  location: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
};

export type Skill = {
  id: number;
  name: string;
  level?: string;
};

export type Language = {
  id: number;
  name: string;
  proficiency?: string; // e.g., Native, Fluent, Intermediate
};

export type Certification = {
  id: number;
  title: string;
};

export type Award = {
  id: number;
  title: string;
};

export type Website = {
  id: number;
  label: string;   // e.g., "Portfolio", "GitHub", "LinkedIn"
  url: string;
};

export type Reference = {
  id: number;
  name: string;
  relationship?: string;
  contactInfo?: string;
};

export type Hobby = {
  id: number;
  name: string;
};

export type CustomSection = {
  id: number;
  title: string;
  content: string;
};

export type ResumeData = {
  contact: Contact;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  summary: string;
  showExperienceLevel?: boolean;

  templateId?: number;

  // Optional extended sections
  languages?: Language[];
  certifications?: Certification[];
  awards?: Award[];
  websites?: Website[];
  references?: Reference[];
  hobbies?: Hobby[];
  customSections?: CustomSection[];

};

export interface DashboardProps {
    resumes: Resume[];
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
} 