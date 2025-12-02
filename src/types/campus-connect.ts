// Campus Connect Types

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  age?: number;
  branch?: string;
  year?: number;
  bio?: string;
  interests: string[];
  hobbies: string[];
  goals: string[];
  personality_social_level: number;
  personality_activity_level: number;
  personality_communication: 'text' | 'vc' | 'in-person';
  personality_wake_cycle: 'early-bird' | 'night-owl' | 'flexible';
  dating_mode: boolean;
  dating_preference?: 'male' | 'female' | 'everyone';
  instagram_handle?: string;
  gender?: string;
  avatar_url?: string;
  photos?: string[];
  prompt_good_at?: string;
  prompt_care_about?: string;
  prompt_looking_for?: string;
  is_banned?: boolean;
  is_suspended?: boolean;
  suspension_until?: string;
  verified: boolean;
  college?: string;
  onboarding_completed: boolean;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  is_dating_match: boolean;
  compatibility_score: number;
}

export interface MatchWithProfile extends Match {
  profile: Profile;
  lastMessage?: Message;
}

export interface Like {
  id: string;
  from_user: string;
  to_user: string;
  created_at: string;
  type: 'friend' | 'project' | 'study' | 'dating';
}

export interface Chat {
  id: string;
  created_at: string;
  match_id: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  created_at: string;
}

// Request types for non-dating request-based system
export interface Request {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  related_interests: string[];
  status: 'open' | 'closed';
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

export interface RequestWithProfile extends Request {
  profile: Profile;
  memberCount?: number;
  hasJoined?: boolean;
  members?: Profile[];
}

export interface RequestMember {
  id: string;
  request_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// Constants
export const INTERESTS = [
  'Web Development', 'AI/ML', 'Mobile Dev', 'Data Science', 'Cybersecurity',
  'Cloud Computing', 'DevOps', 'Blockchain', 'Game Dev', 'UI/UX Design',
  'Product Management', 'Entrepreneurship', 'Research', 'Open Source'
];

export const HOBBIES = [
  'Gaming', 'Photography', 'Music', 'Singing', 'Dancing', 'Theatre',
  'Reading', 'Writing', 'Gym', 'Running', 'Sports', 'Cooking',
  'Travel', 'Movies', 'Anime', 'Art', 'Volunteering', 'Podcasts'
];

export const GOALS = [
  'friends', 'project partner', 'hackathon team', 'study group', 
  'collab'
];

export const GOAL_LABELS: Record<string, string> = {
  'friends': 'Make Friends',
  'project partner': 'Find Project Partners',
  'hackathon team': 'Build Hackathon Teams',
  'study group': 'Join Study Groups',
  'collab': 'Collaborate on Ideas'
};

export const BRANCHES = [
  'Computer Science', 'Information Technology', 'Electronics', 
  'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology',
  'Data Science', 'AI & ML', 'Business', 'Design', 'Other'
];

export const YEARS = [1, 2, 3, 4, 5];

export const REQUEST_CATEGORIES = [
  { value: 'gym', label: 'Gym Partner', icon: '💪' },
  { value: 'project', label: 'Project Partner', icon: '💻' },
  { value: 'study', label: 'Study Group', icon: '📚' },
  { value: 'hackathon', label: 'Hackathon Team', icon: '🚀' },
  { value: 'sports', label: 'Sports Buddy', icon: '⚽' },
  { value: 'music', label: 'Music Buddy', icon: '🎵' },
  { value: 'gaming', label: 'Gaming Partner', icon: '🎮' },
  { value: 'event', label: 'Event Buddy', icon: '🎉' },
  { value: 'food', label: 'Food Buddy', icon: '🍕' },
  { value: 'travel', label: 'Travel Partner', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '✨' }
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' }
];

export const DATING_PREFERENCES = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'everyone', label: 'Everyone' }
];

export interface DiscoverFilters {
  interests: string[];
  hobbies: string[];
  goals: string[];
  branch?: string;
  year?: number;
  datingOnly: boolean;
  socialRange: [number, number];
  activityRange: [number, number];
}
