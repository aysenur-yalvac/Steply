const fs = require("fs");
let content = fs.readFileSync("src/lib/database.types.ts", "utf8");

// Update profiles Row type to include teacher_status, institution_code, verification_doc_url
const oldProfileRow = `        Row: {
          id: string
          full_name: string | null
          role: 'student' | 'teacher' | null
          steply_score: number
          created_at: string
          institution: string | null
          avatar_url: string | null
          bio: string | null
          phone_number: string | null
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          website_url: string | null
          email: string | null
        }`;
const newProfileRow = `        Row: {
          id: string
          full_name: string | null
          role: 'student' | 'teacher' | 'admin' | null
          steply_score: number
          created_at: string
          institution: string | null
          avatar_url: string | null
          bio: string | null
          phone_number: string | null
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          website_url: string | null
          email: string | null
          teacher_status: 'unverified' | 'pending' | 'verified' | null
          institution_code: string | null
          verification_doc_url: string | null
        }`;

content = content.replace(oldProfileRow, newProfileRow);

// Also update Insert type
const oldProfileInsert = `        Insert: {
          id: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          steply_score?: number
          created_at?: string
          institution?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          email?: string | null
        }`;
const newProfileInsert = `        Insert: {
          id: string
          full_name?: string | null
          role?: 'student' | 'teacher' | 'admin' | null
          steply_score?: number
          created_at?: string
          institution?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          email?: string | null
          teacher_status?: 'unverified' | 'pending' | 'verified' | null
          institution_code?: string | null
          verification_doc_url?: string | null
        }`;

content = content.replace(oldProfileInsert, newProfileInsert);

// Update type
const oldProfileUpdate = `        Update: {
          id?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          steply_score?: number
          created_at?: string
          institution?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          email?: string | null
        }`;
const newProfileUpdate = `        Update: {
          id?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | 'admin' | null
          steply_score?: number
          created_at?: string
          institution?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          email?: string | null
          teacher_status?: 'unverified' | 'pending' | 'verified' | null
          institution_code?: string | null
          verification_doc_url?: string | null
        }`;

content = content.replace(oldProfileUpdate, newProfileUpdate);

fs.writeFileSync("src/lib/database.types.ts", content, "utf8");
console.log("database.types.ts updated");
console.log("Has teacher_status:", content.includes("teacher_status"));
