// Database helper functions for Campus Connect
import { supabase } from '@/integrations/supabase/client';
import { Profile, Match, Like, Chat, Message, Block, Report, DiscoverFilters, MatchWithProfile, Request, RequestWithProfile, RequestMember } from '@/types/campus-connect';
import { calculateCompatibility, isDatingCompatible } from './matching';

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data as Profile | null;
}

export async function createProfile(profile: Partial<Profile> & { id: string; name: string }): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Profile;
}

// Upload avatar
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });
  
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  return publicUrl;
}

// Get blocked user IDs for current user
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const { data: blockedByMe } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);
  
  const { data: blockedMe } = await supabase
    .from('blocks')
    .select('blocker_id')
    .eq('blocked_id', userId);
  
  const blockedIds = new Set<string>();
  blockedByMe?.forEach(b => blockedIds.add(b.blocked_id));
  blockedMe?.forEach(b => blockedIds.add(b.blocker_id));
  
  return Array.from(blockedIds);
}

// Get matched user IDs
export async function getMatchedUserIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('matches')
    .select('user_a, user_b')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  
  if (!data) return [];
  
  return data.map(m => m.user_a === userId ? m.user_b : m.user_a);
}

// Get liked user IDs (users I already liked)
export async function getLikedUserIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('likes')
    .select('to_user')
    .eq('from_user', userId);
  
  return data?.map(l => l.to_user) || [];
}

// Discover profiles for dating (with STRICT mutual preference matching)
export async function discoverDatingProfiles(
  currentUserId: string,
  currentProfile: Profile,
  limit = 20
): Promise<(Profile & { compatibility: number; sharedInterests: string[] })[]> {
  if (!currentProfile.dating_mode) return [];
  
  const [blockedIds, matchedIds, likedIds] = await Promise.all([
    getBlockedUserIds(currentUserId),
    getMatchedUserIds(currentUserId),
    getLikedUserIds(currentUserId)
  ]);
  
  const excludeIds = new Set([currentUserId, ...blockedIds, ...matchedIds, ...likedIds]);
  
  // Build query for dating profiles
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('onboarding_completed', true)
    .eq('dating_mode', true);
  
  // STRICT: Filter by current user's dating preference - only show exact gender match
  if (currentProfile.dating_preference && currentProfile.dating_preference !== 'everyone') {
    // User wants specific gender - strictly enforce it
    query = query.eq('gender', currentProfile.dating_preference);
  }
  
  const { data, error } = await query.limit(100);
  
  if (error) throw error;
  if (!data) return [];
  
  // Filter for STRICT mutual preference match
  const profiles = (data as Profile[])
    .filter(p => {
      if (excludeIds.has(p.id)) return false;
      
      // Skip profiles without gender set when user has specific preference
      if (currentProfile.dating_preference && currentProfile.dating_preference !== 'everyone') {
        if (!p.gender || p.gender !== currentProfile.dating_preference) return false;
      }
      
      // STRICT: Check if their preference matches current user's gender
      // They must either want "everyone" OR specifically want my gender
      if (p.dating_preference && p.dating_preference !== 'everyone') {
        if (p.dating_preference !== currentProfile.gender) return false;
      }
      
      // If I want everyone but they have a specific preference, they must want my gender
      if (currentProfile.dating_preference === 'everyone' && p.dating_preference !== 'everyone') {
        if (p.dating_preference !== currentProfile.gender) return false;
      }
      
      return true;
    })
    .map(p => ({
      ...p,
      compatibility: calculateCompatibility(currentProfile, p),
      sharedInterests: [...currentProfile.interests, ...currentProfile.hobbies]
        .filter(i => [...p.interests, ...p.hobbies].includes(i))
    }))
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit);
  
  return profiles;
}

// Discover profiles (non-dating - kept for backwards compatibility)
export async function discoverProfiles(
  currentUserId: string,
  currentProfile: Profile,
  filters?: DiscoverFilters,
  limit = 20
): Promise<(Profile & { compatibility: number; sharedInterests: string[] })[]> {
  // Get exclusion lists
  const [blockedIds, matchedIds, likedIds] = await Promise.all([
    getBlockedUserIds(currentUserId),
    getMatchedUserIds(currentUserId),
    getLikedUserIds(currentUserId)
  ]);
  
  const excludeIds = new Set([currentUserId, ...blockedIds, ...matchedIds, ...likedIds]);
  
  // Build query
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('onboarding_completed', true);
  
  // Apply filters
  if (filters?.branch) {
    query = query.eq('branch', filters.branch);
  }
  if (filters?.year) {
    query = query.eq('year', filters.year);
  }
  if (filters?.datingOnly && currentProfile.dating_mode) {
    query = query.eq('dating_mode', true);
  }
  if (filters?.interests?.length) {
    query = query.overlaps('interests', filters.interests);
  }
  if (filters?.hobbies?.length) {
    query = query.overlaps('hobbies', filters.hobbies);
  }
  if (filters?.goals?.length) {
    query = query.overlaps('goals', filters.goals);
  }
  
  const { data, error } = await query.limit(100);
  
  if (error) throw error;
  if (!data) return [];
  
  // Filter out excluded users and calculate compatibility
  const profiles = (data as Profile[])
    .filter(p => !excludeIds.has(p.id))
    .map(p => ({
      ...p,
      compatibility: calculateCompatibility(currentProfile, p),
      sharedInterests: currentProfile.interests.filter(i => p.interests.includes(i))
    }))
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit);
  
  return profiles;
}

// Like functions
export async function createLike(fromUser: string, toUser: string, type: Like['type']): Promise<{ matched: boolean; matchId?: string }> {
  // Check if mutual like exists
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('from_user', toUser)
    .eq('to_user', fromUser)
    .maybeSingle();
  
  // Create the like
  const { error: likeError } = await supabase
    .from('likes')
    .insert({ from_user: fromUser, to_user: toUser, type });
  
  if (likeError) throw likeError;
  
  // If mutual like, create match
  if (existingLike) {
    // Get both profiles to calculate compatibility
    const [profileA, profileB] = await Promise.all([
      getProfile(fromUser),
      getProfile(toUser)
    ]);
    
    if (!profileA || !profileB) throw new Error('Profiles not found');
    
    const compatibility = calculateCompatibility(profileA, profileB);
    const isDating = isDatingCompatible(profileA, profileB) && 
                     (type === 'dating' || existingLike.type === 'dating');
    
    // Ensure user_a < user_b for uniqueness
    const [user_a, user_b] = fromUser < toUser ? [fromUser, toUser] : [toUser, fromUser];
    
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        user_a,
        user_b,
        compatibility_score: compatibility,
        is_dating_match: isDating
      })
      .select()
      .single();
    
    if (matchError) throw matchError;
    
    // Create chat for the match
    await supabase
      .from('chats')
      .insert({ match_id: match.id });
    
    return { matched: true, matchId: match.id };
  }
  
  return { matched: false };
}

// Match functions
export async function getMatches(userId: string): Promise<MatchWithProfile[]> {
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      chats (id, last_message_at)
    `)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  if (!matches) return [];
  
  // Get the other user's profile for each match
  const matchesWithProfiles: MatchWithProfile[] = [];
  
  for (const match of matches) {
    const otherUserId = match.user_a === userId ? match.user_b : match.user_a;
    const profile = await getProfile(otherUserId);
    
    if (profile) {
      // Get last message if chat exists
      let lastMessage: Message | undefined;
      const chatData = match.chats as unknown as Chat[] | null;
      if (chatData && chatData[0]) {
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatData[0].id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        lastMessage = msgData as Message | undefined;
      }
      
      matchesWithProfiles.push({
        ...match,
        profile,
        lastMessage
      });
    }
  }
  
  return matchesWithProfiles;
}

export async function unmatch(matchId: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);
  
  if (error) throw error;
}

// Chat functions
export async function getChatByMatchId(matchId: string): Promise<Chat | null> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('match_id', matchId)
    .maybeSingle();
  
  if (error) throw error;
  return data as Chat | null;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return (data as Message[]) || [];
}

export async function sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ chat_id: chatId, sender_id: senderId, content })
    .select()
    .single();
  
  if (error) throw error;
  return data as Message;
}

export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .is('read_at', null);
}

// Block functions
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  
  if (error) throw error;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  
  if (error) throw error;
}

export async function getBlockedUsers(userId: string): Promise<Profile[]> {
  const { data: blocks } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);
  
  if (!blocks || blocks.length === 0) return [];
  
  const profiles: Profile[] = [];
  for (const block of blocks) {
    const profile = await getProfile(block.blocked_id);
    if (profile) profiles.push(profile);
  }
  
  return profiles;
}

// Report functions
export async function reportUser(reporterId: string, reportedId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .insert({ reporter_id: reporterId, reported_id: reportedId, reason });
  
  if (error) throw error;
}

// ==================== REQUEST FUNCTIONS ====================

// Get members of a request with their profiles
export async function getRequestMembers(requestId: string): Promise<Profile[]> {
  const { data: members, error } = await supabase
    .from('request_members')
    .select('user_id')
    .eq('request_id', requestId)
    .eq('status', 'accepted');
  
  if (error) throw error;
  if (!members) return [];
  
  const profiles: Profile[] = [];
  for (const member of members) {
    const profile = await getProfile(member.user_id);
    if (profile) profiles.push(profile);
  }
  
  return profiles;
}

// Get all open requests
export async function getRequests(
  currentUserId: string,
  currentProfile: Profile,
  category?: string
): Promise<RequestWithProfile[]> {
  const blockedIds = await getBlockedUserIds(currentUserId);
  
  let query = supabase
    .from('requests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  if (!data) return [];
  
  // Filter out blocked users and get profiles
  const requests: RequestWithProfile[] = [];
  
  for (const req of data) {
    if (blockedIds.includes(req.user_id)) continue;
    
    const profile = await getProfile(req.user_id);
    if (!profile) continue;
    
    // Check if current user has joined
    const { data: membership } = await supabase
      .from('request_members')
      .select('id')
      .eq('request_id', req.id)
      .eq('user_id', currentUserId)
      .maybeSingle();
    
    // Get member count
    const { count } = await supabase
      .from('request_members')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', req.id)
      .eq('status', 'accepted');
    
    requests.push({
      ...req as Request,
      profile,
      memberCount: count || 0,
      hasJoined: !!membership
    });
  }
  
  // Sort by relevance to user's interests
  const userInterests = new Set([...currentProfile.interests, ...currentProfile.hobbies]);
  
  return requests.sort((a, b) => {
    const aRelevance = a.related_interests.filter(i => userInterests.has(i)).length;
    const bRelevance = b.related_interests.filter(i => userInterests.has(i)).length;
    return bRelevance - aRelevance;
  });
}

// Create a new request
export async function createRequest(
  userId: string,
  request: Omit<Request, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>
): Promise<Request> {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      user_id: userId,
      ...request,
      status: 'open'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Request;
}

// Update a request
export async function updateRequest(requestId: string, updates: Partial<Request>): Promise<Request> {
  const { data, error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', requestId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Request;
}

// Delete a request
export async function deleteRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', requestId);
  
  if (error) throw error;
}

// Join a request - also creates a non-dating match with the request owner
export async function joinRequest(requestId: string, userId: string): Promise<{ member: RequestMember; matchCreated: boolean; existingMatch: boolean }> {
  // First get the request to find the owner
  const { data: request, error: reqError } = await supabase
    .from('requests')
    .select('user_id')
    .eq('id', requestId)
    .single();
  
  if (reqError) throw reqError;
  
  const ownerId = request.user_id;
  let matchCreated = false;
  let existingMatch = false;
  
  // Don't create match if joining own request
  if (ownerId !== userId) {
    // Check if match already exists
    const [user_a, user_b] = userId < ownerId ? [userId, ownerId] : [ownerId, userId];
    
    const { data: existingMatchData } = await supabase
      .from('matches')
      .select('id')
      .eq('user_a', user_a)
      .eq('user_b', user_b)
      .maybeSingle();
    
    if (existingMatchData) {
      existingMatch = true;
    } else {
      // Create match if doesn't exist
      const [profileA, profileB] = await Promise.all([
        getProfile(userId),
        getProfile(ownerId)
      ]);
      
      const compatibility = profileA && profileB ? calculateCompatibility(profileA, profileB) : 50;
      
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          user_a,
          user_b,
          compatibility_score: compatibility,
          is_dating_match: false // Request matches are never dating matches
        })
        .select()
        .single();
      
      if (matchError) throw matchError;
      
      // Create chat for the match
      await supabase
        .from('chats')
        .insert({ match_id: match.id });
      
      matchCreated = true;
    }
  }
  
  // Add user to request members
  const { data, error } = await supabase
    .from('request_members')
    .insert({
      request_id: requestId,
      user_id: userId,
      status: 'accepted'
    })
    .select()
    .single();
  
  if (error) throw error;
  return { member: data as RequestMember, matchCreated, existingMatch };
}

// Leave a request
export async function leaveRequest(requestId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('request_members')
    .delete()
    .eq('request_id', requestId)
    .eq('user_id', userId);
  
  if (error) throw error;
}

// Get user's own requests
export async function getMyRequests(userId: string): Promise<RequestWithProfile[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  if (!data) return [];
  
  const profile = await getProfile(userId);
  if (!profile) return [];
  
  const requests: RequestWithProfile[] = [];
  for (const req of data) {
    const [countResult, members] = await Promise.all([
      supabase
        .from('request_members')
        .select('*', { count: 'exact', head: true })
        .eq('request_id', req.id)
        .eq('status', 'accepted'),
      getRequestMembers(req.id)
    ]);
    
    requests.push({
      ...req as Request,
      profile,
      memberCount: countResult.count || 0,
      hasJoined: true,
      members
    });
  }
  
  return requests;
}

// Stats
export async function getProfileStats(userId: string): Promise<{
  totalMatches: number;
  friendMatches: number;
  projectMatches: number;
  studyMatches: number;
  datingMatches: number;
}> {
  const { data: matches } = await supabase
    .from('matches')
    .select('is_dating_match')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  
  const totalMatches = matches?.length || 0;
  const datingMatches = matches?.filter(m => m.is_dating_match).length || 0;
  
  return {
    totalMatches,
    friendMatches: Math.floor((totalMatches - datingMatches) * 0.4),
    projectMatches: Math.floor((totalMatches - datingMatches) * 0.3),
    studyMatches: Math.floor((totalMatches - datingMatches) * 0.3),
    datingMatches
  };
}
