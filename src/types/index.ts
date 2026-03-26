export type Role = "employer" | "freelancer";
export type JobType = "full-time" | "part-time" | "contract" | "remote";
export type JobStatus = "open" | "closed";
export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url?: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  location?: string;
  linkedin_url?: string;
  twitter_url?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  bio?: string;
  resume_url?: string;
  skills?: string[];
  portfolio_links?: string[];
  onboarding_complete?: boolean;
  employer_onboarding_complete?: boolean;
  created_at: string;
}

export interface Experience {
  id: string;
  profile_id: string;
  company: string;
  role: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  created_at: string;
}

export interface Education {
  id: string;
  profile_id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year: string;
  end_year?: string;
  created_at: string;
}

export interface Certification {
  id: string;
  profile_id: string;
  name: string;
  issuer: string;
  year?: string;
  url?: string;
  created_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  location: string;
  job_type: JobType;
  salary_range?: string;
  description: string;
  requirements: string;
  status: JobStatus;
  created_at: string;
  profiles?: Profile;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url: string;
  cover_letter?: string;
  status: ApplicationStatus;
  created_at: string;
  jobs?: Job;
  profiles?: Profile;
}
