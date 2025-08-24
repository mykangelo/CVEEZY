export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string;
    provider_id?: string;
    provider_name?: string;
    last_login_at?: string;
    is_admin?: boolean;
    password?: string;
    total_resumes_count?: number;
    completed_resumes_count?: number;
    is_social_user?: boolean;
    has_password?: boolean;
}

export interface EmailVerificationStatus {
    verified: boolean;
    status: 'verified' | 'unverified' | 'social_user';
    message: string;
    recommended: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
