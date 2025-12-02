// Compatibility scoring engine for Campus Connect
import { Profile } from '@/types/campus-connect';

export function calculateCompatibility(userA: Profile, userB: Profile): number {
  let score = 0;
  let maxScore = 0;

  // Interest overlap (weight: 25)
  const interestOverlap = userA.interests.filter(i => userB.interests.includes(i)).length;
  const maxInterests = Math.max(userA.interests.length, userB.interests.length, 1);
  score += (interestOverlap / maxInterests) * 25;
  maxScore += 25;

  // Hobby overlap (weight: 20)
  const hobbyOverlap = userA.hobbies.filter(h => userB.hobbies.includes(h)).length;
  const maxHobbies = Math.max(userA.hobbies.length, userB.hobbies.length, 1);
  score += (hobbyOverlap / maxHobbies) * 20;
  maxScore += 20;

  // Goal overlap (weight: 20)
  const goalOverlap = userA.goals.filter(g => userB.goals.includes(g)).length;
  const maxGoals = Math.max(userA.goals.length, userB.goals.length, 1);
  score += (goalOverlap / maxGoals) * 20;
  maxScore += 20;

  // Personality: Social level similarity (weight: 10)
  const socialDiff = Math.abs(userA.personality_social_level - userB.personality_social_level);
  score += ((10 - socialDiff) / 10) * 10;
  maxScore += 10;

  // Personality: Activity level similarity (weight: 10)
  const activityDiff = Math.abs(userA.personality_activity_level - userB.personality_activity_level);
  score += ((10 - activityDiff) / 10) * 10;
  maxScore += 10;

  // Communication preference match (weight: 8)
  if (userA.personality_communication === userB.personality_communication) {
    score += 8;
  } else {
    score += 4; // Partial match
  }
  maxScore += 8;

  // Wake cycle match (weight: 7)
  if (userA.personality_wake_cycle === userB.personality_wake_cycle) {
    score += 7;
  } else if (userA.personality_wake_cycle === 'flexible' || userB.personality_wake_cycle === 'flexible') {
    score += 5; // Flexible is partially compatible with anything
  } else {
    score += 2;
  }
  maxScore += 7;

  // Normalize to 0-100
  return Math.round((score / maxScore) * 100);
}

export function getSharedInterests(userA: Profile, userB: Profile): string[] {
  return userA.interests.filter(i => userB.interests.includes(i));
}

export function getSharedHobbies(userA: Profile, userB: Profile): string[] {
  return userA.hobbies.filter(h => userB.hobbies.includes(h));
}

export function getSharedGoals(userA: Profile, userB: Profile): string[] {
  return userA.goals.filter(g => userB.goals.includes(g));
}

export function isDatingCompatible(userA: Profile, userB: Profile): boolean {
  return userA.dating_mode && userB.dating_mode;
}
