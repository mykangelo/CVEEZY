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
        email: string;
        phone: string;
        address?: string;
        websites?: string[];
    };
    experiences: Array<{
        id: number;
        jobTitle: string;
        company: string;
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
        level: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
    }>;
    summary: string;
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