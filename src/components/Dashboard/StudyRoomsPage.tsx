import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Users, X, Copy, Check, Clock, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
const ZegoVideoRoom = React.lazy(() => import('./ZegoVideoRoom').then(m => ({ default: m.ZegoVideoRoom })));
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { useConfirm } from '../../hooks/useConfirm';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { useSubscriptionUpsellGate } from '../../contexts/SubscriptionUpsellGateContext';
import { UsernameSetupModal } from './UsernameSetupModal';
import { useFloatingVideoStore } from '../../stores/useFloatingVideoStore';
import { FriendsPanel } from './Social/FriendsPanel';
import { GroupsPanel } from './Social/GroupsPanel';
import { GroupChat } from './Social/GroupChat';
import { PageHeader, ScholarButton, SectionTabs, type SectionTab } from '../Scholar';

interface StudyRoom {
  id: string;
  creator_id: string;
  room_name: string;
  room_description: string;
  room_code: string;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  participant_count?: number;
}

interface RoomParticipant {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  joined_at: string;
  is_host: boolean;
}

const ROOM_TOOLS = ['Video', 'Microphone', 'Whiteboard', 'Screen', 'Chat', 'File Share', 'Pomodoro', 'AI Tutor', 'Recording'] as const;

export const StudyRoomsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const { confirm, ConfirmModal } = useConfirm();
  const { shouldShowTutorial, showTutorial, isTutorialOpen, completeTutorial, skipTutorial, config: tutorialConfig } = usePageTutorial('study-rooms');
  const { setBusy } = useSubscriptionUpsellGate();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-rooms' | 'create' | 'friends' | 'groups' | 'group-chat'>('browse');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [hasUsername, setHasUsername] = useState(false);
  const [activeGroupChat, setActiveGroupChat] = useState<{ groupId: string; groupName: string } | null>(null);

  useEffect(() => {
    if (user) {
      supabase.from('user_profiles').select('username').eq('id', user.id).single().then(({ data }) => {
        setHasUsername(!!data?.username);
      });
    }
  }, [user]);

  const handleSocialTabClick = (tab: 'friends' | 'groups') => {
    if (!hasUsername) {
      setShowUsernameModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleOpenGroupChat = (groupId: string, groupName: string) => {
    setActiveGroupChat({ groupId, groupName });
    setActiveTab('group-chat');
  };
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [myRooms, setMyRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);

  useEffect(() => {
    setBusy('studyRoom', !!selectedRoom);
    return () => setBusy('studyRoom', false);
  }, [selectedRoom, setBusy]);

  useEffect(() => {
    useFloatingVideoStore.getState().setStudyRoomsForeground(true);
    return () => useFloatingVideoStore.getState().setStudyRoomsForeground(false);
  }, []);

  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>('');

  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [whenMode, setWhenMode] = useState<'now' | 'later'>('later');
  const [toolsEnabled, setToolsEnabled] = useState<Record<string, boolean>>(() => ({
    'Video': true, 'Microphone': true, 'Whiteboard': true,
    'Screen': false, 'Chat': true, 'File Share': false,
    'Pomodoro': false, 'AI Tutor': false, 'Recording': false,
  }));
  const [creating, setCreating] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [leavingRoom, setLeavingRoom] = useState(false);
  const [creditsExhaustedCountdown, setCreditsExhaustedCountdown] = useState<number | null>(null);
  const [browseSearchQuery, setBrowseSearchQuery] = useState('');
  const zegoPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forceLeaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forceLeaveTriggeredRef = useRef(false);

  const filteredBrowseRooms = useMemo(() => {
    const q = browseSearchQuery.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.room_name.toLowerCase().includes(q) ||
        r.room_code.toLowerCase().includes(q) ||
        (r.room_description && r.room_description.toLowerCase().includes(q))
    );
  }, [rooms, browseSearchQuery]);

  const displayRoomList = activeTab === 'browse' ? filteredBrowseRooms : myRooms;
  const browseSearchNoMatches =
    activeTab === 'browse' &&
    !loading &&
    rooms.length > 0 &&
    filteredBrowseRooms.length === 0 &&
    browseSearchQuery.trim().length > 0;

  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchMyRooms();
      fetchUserDisplayName();
    }
  }, [user, activeTab]);

  // Show tutorial on first visit
  useEffect(() => {
    if (shouldShowTutorial && !loading) {
      const timer = setTimeout(() => {
        showTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, loading, showTutorial]);

  const fetchUserDisplayName = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.display_name) {
        setUserDisplayName(profile.display_name);
      } else {
        // Fallback to email prefix
        const emailPrefix = user.email?.split('@')[0] || 'User';
        setUserDisplayName(emailPrefix);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'fetchUserDisplayName', userId: user?.id });
      setUserDisplayName(user.email?.split('@')[0] || 'Anonymous');
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      fetchParticipants();

      // Real-time subscription for participant changes
      const participantsChannel = supabase
        .channel(`room-${selectedRoom.id}-participants`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'study_room_participants',
          filter: `room_id=eq.${selectedRoom.id}`
        }, async (_payload) => {
          await fetchParticipants();
          
          // Check if room should be auto-ended (no active participants)
          if (selectedRoom) {
            const { count, error: countError } = await supabase
              .from('study_room_participants')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', selectedRoom.id)
              .is('left_at', null);

            if (!countError && count === 0) {
              // Last participant left - end the room
              ErrorLogger.info('Last participant left - auto-ending room via real-time update', { component: 'StudyRoomsPage', action: 'participantSubscription', roomId: selectedRoom.id });
              const { error: endRoomError } = await supabase
                .from('study_rooms')
                .update({ is_active: false })
                .eq('id', selectedRoom.id);

              if (!endRoomError) {
                // Room ended - clear selection and refresh lists
                setSelectedRoom(null);
                setShowVideo(false);
                await Promise.all([fetchRooms(), fetchMyRooms()]);
                showSuccessToast('Room ended - all participants have left');
              }
            }
          }
        })
        .subscribe();

      return () => {
        participantsChannel.unsubscribe();
        supabase.removeChannel(participantsChannel);
      };
    }
  }, [selectedRoom?.id]);

  // In-session Zego credit check: poll every 60s; when 0, show 30s warning then force leave
  useEffect(() => {
    if (!showVideo || !selectedRoom || !user) {
      setCreditsExhaustedCountdown(null);
      return;
    }
    forceLeaveTriggeredRef.current = false;
    const limitMessage = t('study_rooms.usage_limit_reached') || 'Study room usage limit reached. You have no Study Room credits left. Top up or renew to use study rooms again.';
    const warningMessage = t('study_rooms.credits_exhausted_warning') || 'Study room credits exhausted. You will be removed in 30 seconds.';

    const check = async () => {
      const { data } = await supabase.rpc('can_use_study_room', { p_user_id: user.id });
      const allowed = data?.allowed === true;
      const remaining = data?.zego_credits_remaining ?? 0;
      if (allowed && remaining > 0) return;
      if (forceLeaveTriggeredRef.current) return;
      if (zegoPollIntervalRef.current) {
        clearInterval(zegoPollIntervalRef.current);
        zegoPollIntervalRef.current = null;
      }
      setCreditsExhaustedCountdown(30);
      showErrorToast(warningMessage);
      if (forceLeaveTimeoutRef.current) clearTimeout(forceLeaveTimeoutRef.current);
      forceLeaveTimeoutRef.current = setTimeout(async () => {
        if (forceLeaveTriggeredRef.current) return;
        forceLeaveTriggeredRef.current = true;
        try {
          await supabase.rpc('force_leave_study_rooms', { p_user_id: user.id });
        } catch (e) {
          ErrorLogger.warn('force_leave_study_rooms error', { component: 'StudyRoomsPage', error: e });
        }
        setShowVideo(false);
        setSelectedRoom(null);
        setCreditsExhaustedCountdown(null);
        await Promise.all([fetchRooms(), fetchMyRooms()]);
        showErrorToast(limitMessage);
      }, 30000);
    };

    check();
    zegoPollIntervalRef.current = setInterval(check, 60000);
    return () => {
      if (zegoPollIntervalRef.current) {
        clearInterval(zegoPollIntervalRef.current);
        zegoPollIntervalRef.current = null;
      }
      if (forceLeaveTimeoutRef.current) {
        clearTimeout(forceLeaveTimeoutRef.current);
        forceLeaveTimeoutRef.current = null;
      }
      setCreditsExhaustedCountdown(null);
    };
  }, [showVideo, selectedRoom?.id, user?.id]);

  // Countdown tick for credits exhausted warning
  useEffect(() => {
    if (creditsExhaustedCountdown == null || creditsExhaustedCountdown <= 0) return;
    const tick = setInterval(() => {
      setCreditsExhaustedCountdown((prev) => (prev == null || prev <= 1 ? null : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [creditsExhaustedCountdown]);

  const fetchRooms = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        const message = handleSupabaseError(error, { component: 'StudyRoomsPage', action: 'fetchRooms' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'StudyRoomsPage', action: 'fetchRooms' });
        showErrorToast(message);
        setLoading(false);
        return;
      }

      if (data) {
        const roomsWithCounts = await Promise.all(
          data.map(async (room) => {
            try {
              const { count, error } = await supabase
                .from('study_room_participants')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id)
                .is('left_at', null);

              if (error) {
                ErrorLogger.warn('Failed to fetch participant count', { component: 'StudyRoomsPage', action: 'fetchRooms', roomId: room.id, error });
                return { ...room, participant_count: 0 };
              }

              return { ...room, participant_count: count || 0 };
            } catch (error) {
              ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'StudyRoomsPage', action: 'fetchRooms', roomId: room.id });
              return { ...room, participant_count: 0 };
            }
          })
        );
        setRooms(roomsWithCounts);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'fetchRooms' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('creator_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        const roomsWithCounts = await Promise.all(
          data.map(async (room) => {
            try {
              const { count, error: countError } = await supabase
                .from('study_room_participants')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id)
                .is('left_at', null);

              if (countError) {
                ErrorLogger.warn('Failed to fetch participant count', { component: 'StudyRoomsPage', action: 'fetchMyRooms', roomId: room.id, error: countError });
                return { ...room, participant_count: 0 };
              }

              return { ...room, participant_count: count || 0 };
            } catch (error) {
              ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'StudyRoomsPage', action: 'fetchMyRooms', roomId: room.id });
              return { ...room, participant_count: 0 };
            }
          })
        );
        setMyRooms(roomsWithCounts);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'fetchMyRooms', userId: user?.id });
    }
  };

  const fetchParticipants = async () => {
    if (!selectedRoom) {
      ErrorLogger.debug('fetchParticipants: No room selected', { component: 'StudyRoomsPage', action: 'fetchParticipants' });
      return;
    }

    ErrorLogger.debug('Fetching participants for room', { component: 'StudyRoomsPage', action: 'fetchParticipants', roomId: selectedRoom.id });
    const startTime = Date.now();

    try {
      // Direct query to avoid RPC function errors
      const { data, error } = await supabase
        .from('study_room_participants')
        .select(`
          user_id,
          joined_at,
          is_host,
          left_at,
          user_profiles!inner (
            display_name,
            avatar_url
          )
        `)
        .eq('room_id', selectedRoom.id)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      const fetchTime = Date.now() - startTime;
      ErrorLogger.debug('Participants fetch completed', { component: 'StudyRoomsPage', action: 'fetchParticipants', roomId: selectedRoom.id, durationMs: fetchTime });

      if (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'fetchParticipants', roomId: selectedRoom.id, errorCode: error.code });
        return;
      }

      if (data) {
        // Transform data to match expected format
        const participants = data.map((p: any) => ({
          user_id: p.user_id,
          joined_at: p.joined_at,
          is_host: p.is_host,
          display_name: Array.isArray(p.user_profiles) ? p.user_profiles[0]?.display_name : p.user_profiles?.display_name,
          avatar_url: Array.isArray(p.user_profiles) ? p.user_profiles[0]?.avatar_url : p.user_profiles?.avatar_url
        }));

        ErrorLogger.debug('Participants loaded', { component: 'StudyRoomsPage', action: 'fetchParticipants', roomId: selectedRoom.id, participantCount: participants.length });
        setParticipants(participants);
      }
    } catch (error) {
      const message = handleApiError(error, { component: 'StudyRoomsPage', action: 'fetchParticipants', metadata: { roomId: selectedRoom?.id } });
      showErrorToast(message);
    }
  };

  /** Single place for study room credit check. Returns { allowed, message } for create/join. */
  const checkCanUseStudyRoom = async (): Promise<{ allowed: boolean; message: string }> => {
    const limitMessage = t('study_rooms.usage_limit_reached') || 'Study room usage limit reached. You have no Study Room credits left. Top up or renew to use study rooms again.';
    if (!user) return { allowed: false, message: limitMessage };
    try {
      const { data, error } = await supabase.rpc('can_use_study_room', { p_user_id: user.id });
      if (error) {
        ErrorLogger.warn('can_use_study_room failed', { component: 'StudyRoomsPage', action: 'checkCanUseStudyRoom', error });
        return { allowed: false, message: limitMessage };
      }
      const allowed = data?.allowed === true;
      return { allowed, message: limitMessage };
    } catch (e) {
      ErrorLogger.warn('checkCanUseStudyRoom error', { component: 'StudyRoomsPage', action: 'checkCanUseStudyRoom', error: e });
      return { allowed: false, message: limitMessage };
    }
  };

  const handleCreateRoom = async () => {
    if (!user || !roomName.trim()) {
      ErrorLogger.debug('Validation failed: missing user or room name', { component: 'StudyRoomsPage', action: 'handleCreateRoom' });
      return;
    }

    // Validate room name length
    if (roomName.trim().length > 100) {
      showErrorToast('Room name must be 100 characters or less');
      return;
    }

    // Validate room description length
    if (roomDescription.trim().length > 500) {
      showErrorToast('Room description must be 500 characters or less');
      return;
    }

    // Validate max participants range (minimum 1, maximum 20)
    if (maxParticipants < 1 || maxParticipants > 20) {
      showErrorToast('Room capacity must be between 1 and 20 participants');
      return;
    }

    const { allowed: canUseStudyRoom, message: studyRoomLimitMessage } = await checkCanUseStudyRoom();
    if (!canUseStudyRoom) {
      showErrorToast(studyRoomLimitMessage);
      return;
    }

    ErrorLogger.debug('Starting Room Creation', { component: 'StudyRoomsPage', action: 'handleCreateRoom', userId: user.id, userEmail: user.email, roomName: roomName.trim(), maxParticipants });

    setCreating(true);
    try {
      // Step 1: Ensure user has profile (auto-create if missing)
      ErrorLogger.debug('Step 1: Ensuring user profile exists', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'profileEnsure' });
      const startProfileCheck = Date.now();

      const { data: profileEnsured, error: profileEnsureError } = await supabase
        .rpc('ensure_user_profile_for_room', { user_uuid: user.id });

      const profileCheckTime = Date.now() - startProfileCheck;
      ErrorLogger.debug('Profile ensure completed', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'profileEnsure', durationMs: profileCheckTime, profileEnsured, hasError: !!profileEnsureError });

      if (profileEnsureError) {
        const errorMessage = handleSupabaseError(profileEnsureError, { component: 'StudyRoomsPage', action: 'handleCreateRoom', metadata: { step: 'profileEnsure' } });
        ErrorLogger.error(profileEnsureError instanceof Error ? profileEnsureError : new Error(String(profileEnsureError)), { component: 'StudyRoomsPage', action: 'handleCreateRoom', metadata: { step: 'profileEnsure' } });
        throw new Error(errorMessage);
      }

      if (!profileEnsured) {
        const error = new Error('Could not verify user profile. Please contact support.');
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleCreateRoom', metadata: { step: 'profileEnsure' } });
        throw error;
      }

      ErrorLogger.info('User profile confirmed/created', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'profileEnsure' });

      // Step 2: Generate room code
      ErrorLogger.debug('Step 2: Generating room code', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode' });
      let roomCode: string;
      const startCodeGen = Date.now();

      try {
        ErrorLogger.debug('Calling generate_room_code RPC', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode' });
        const { data: roomCodeData, error: rpcError } = await supabase
          .rpc('generate_room_code');

        const codeGenTime = Date.now() - startCodeGen;
        ErrorLogger.debug('RPC completed', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', durationMs: codeGenTime, hasError: !!rpcError });

        if (rpcError) {
          ErrorLogger.warn('generate_room_code RPC failed', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', rpcError });
          throw rpcError;
        }

        roomCode = roomCodeData;
        ErrorLogger.info('Room code generated', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', roomCode });
      } catch (rpcError) {
        ErrorLogger.warn('RPC failed, using fallback generation', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', rpcError });

        // Fallback with collision check - generate exactly 8 characters
        let attempts = 0;
        const maxAttempts = 10;
        let codeGenerated = false;

        while (attempts < maxAttempts && !codeGenerated) {
          // Generate exactly 8 characters
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          roomCode = '';
          for (let i = 0; i < 8; i++) {
            roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }

          ErrorLogger.debug('Fallback code generated', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', roomCode, attempt: attempts + 1 });
          ErrorLogger.debug('Checking code uniqueness', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', roomCode });

          const { data: existing, error: checkError } = await supabase
            .from('study_rooms')
            .select('id')
            .eq('room_code', roomCode)
            .maybeSingle();

          ErrorLogger.debug('Uniqueness check result', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', roomCode, hasExisting: !!existing, hasError: !!checkError });

          if (checkError) {
            const error = new Error(`Code uniqueness check failed: ${checkError.message}`);
            ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleCreateRoom', checkError });
            throw error;
          }

          if (!existing) {
            codeGenerated = true;
            ErrorLogger.info('Fallback code is unique', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', roomCode });
          } else {
            attempts++;
            ErrorLogger.debug('Code collision detected, retrying', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', attempt: attempts });
          }
        }

        if (!codeGenerated) {
          const error = new Error('Failed to generate unique room code after multiple attempts');
          ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'generateCode', attempts: maxAttempts });
          throw error;
        }
      }

      // Step 3: Insert room
      ErrorLogger.debug('Step 3: Creating room in database', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'roomInsert' });
      const roomData = {
        creator_id: user.id,
        room_name: roomName.trim(),
        room_description: roomDescription.trim() || null,
        room_code: roomCode,
        max_participants: maxParticipants,
        is_active: true,
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
      };
      ErrorLogger.debug('Room data prepared', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'roomInsert', roomName: roomData.room_name, roomCode: roomData.room_code, maxParticipants: roomData.max_participants });
      const startRoomInsert = Date.now();

      const { data: newRoom, error: roomError } = await supabase
        .from('study_rooms')
        .insert(roomData)
        .select()
        .single();

      const roomInsertTime = Date.now() - startRoomInsert;
      ErrorLogger.debug('Room insert completed', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'roomInsert', durationMs: roomInsertTime, hasError: !!roomError, roomId: newRoom?.id });

      if (roomError) {
        const errorMessage = handleSupabaseError(roomError, { component: 'StudyRoomsPage', action: 'handleCreateRoom', metadata: { step: 'roomInsert' } });
        ErrorLogger.error(roomError instanceof Error ? roomError : new Error(String(roomError)), { component: 'StudyRoomsPage', action: 'handleCreateRoom', metadata: { step: 'roomInsert' } });
        throw new Error(errorMessage);
      }

      if (!newRoom) {
        const error = new Error('Room created but no data returned');
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleCreateRoom', roomName, roomCode });
        throw error;
      }

      ErrorLogger.info('Room created successfully', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'roomInsert', roomId: newRoom.id });

      // Step 4: Join as host
      ErrorLogger.debug('Step 4: Joining room as host', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'joinAsHost', roomId: newRoom.id });
      const participantData = {
        room_id: newRoom.id,
        user_id: user.id,
        is_host: true
      };
      ErrorLogger.debug('Participant data prepared', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'joinAsHost', roomId: newRoom.id, userId: user.id });
      const startParticipantInsert = Date.now();

      const { error: participantError } = await supabase
        .from('study_room_participants')
        .insert(participantData);

      const participantInsertTime = Date.now() - startParticipantInsert;
      ErrorLogger.debug('Participant insert completed', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'joinAsHost', durationMs: participantInsertTime, hasError: !!participantError });

      if (participantError) {
        const error = new Error(`Failed to join room: ${participantError.message}`);
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleCreateRoom', roomId: newRoom.id, errorCode: participantError.code, details: participantError.details });
        throw error;
      }

      ErrorLogger.info('Successfully joined as host', { component: 'StudyRoomsPage', action: 'handleCreateRoom', step: 'joinAsHost', roomId: newRoom.id });

      // Success - Auto-join the room immediately
      ErrorLogger.info('Room Creation Successful', { component: 'StudyRoomsPage', action: 'handleCreateRoom', roomId: newRoom.id, roomCode: newRoom.room_code });

      // Clear form
      setRoomName('');
      setRoomDescription('');
      setMaxParticipants(10);

      // Auto-join: Set the newly created room as selected and open video
      ErrorLogger.debug('Auto-joining room as host', { component: 'StudyRoomsPage', action: 'handleCreateRoom', roomId: newRoom.id });
      setSelectedRoom(newRoom);
      setShowVideo(true); // Automatically start video for creator
      ErrorLogger.info('Opened room interface with video', { component: 'StudyRoomsPage', action: 'handleCreateRoom', roomId: newRoom.id });

      // Refresh room list in background
      ErrorLogger.debug('Fetching updated room list', { component: 'StudyRoomsPage', action: 'handleCreateRoom' });
      fetchMyRooms();

    } catch (error) {
      const errorMessage = handleApiError(error, { component: 'StudyRoomsPage', action: 'handleCreateRoom' });
      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'StudyRoomsPage', action: 'handleCreateRoom' });
      showErrorToast(errorMessage);
    } finally {
      setCreating(false);
      ErrorLogger.debug('Room creation process ended', { component: 'StudyRoomsPage', action: 'handleCreateRoom' });
    }
  };

  const handleJoinRoom = async (room: StudyRoom) => {
    if (!user || joiningRoom) {
      ErrorLogger.debug('Cannot join: user not authenticated or already joining', { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id });
      return;
    }

    // Check if room is expired
    if (new Date(room.expires_at) < new Date()) {
      showErrorToast('This room has expired. Please join another room.');
      return;
    }

    // Check if room is inactive
    if (!room.is_active) {
      showErrorToast('This room is no longer active. Please join another room.');
      return;
    }

    const { allowed: canUseStudyRoom, message: studyRoomLimitMessage } = await checkCanUseStudyRoom();
    if (!canUseStudyRoom) {
      showErrorToast(studyRoomLimitMessage);
      return;
    }

    setJoiningRoom(true);
    ErrorLogger.debug('Joining Room', { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id, roomName: room.room_name, roomCode: room.room_code, userId: user.id });

    try {
      // Step 1: Ensure user has profile
      ErrorLogger.debug('Step 1: Ensuring user profile exists', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'profileEnsure', roomId: room.id });
      const { data: profileEnsured, error: profileError } = await supabase
        .rpc('ensure_user_profile_for_room', { user_uuid: user.id });

      if (profileError) {
        const error = new Error(`Profile verification failed: ${profileError.message}`);
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id, profileError });
        throw error;
      }

      if (!profileEnsured) {
        const error = new Error('Could not verify user profile. Please refresh and try again.');
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id });
        throw error;
      }
      ErrorLogger.info('Profile verified', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'profileEnsure', roomId: room.id });

      // Step 2: Check if already in room
      ErrorLogger.debug('Step 2: Checking if already in room', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'checkExisting', roomId: room.id });
      const { data: existingParticipant, error: checkError } = await supabase
        .from('study_room_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .is('left_at', null)
        .maybeSingle();

      if (checkError) {
        const error = new Error(`Failed to check room status: ${checkError.message}`);
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id, checkError });
        throw error;
      }

      if (existingParticipant) {
        ErrorLogger.debug('Already in room, rejoining', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'checkExisting', roomId: room.id, participantId: existingParticipant.user_id });
        setSelectedRoom(room);
        setShowVideo(true);  // Auto-start video when rejoining
        ErrorLogger.info('Rejoined room successfully with video', { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id });
        return;
      }
      ErrorLogger.debug('Not in room, joining as new participant', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'checkExisting', roomId: room.id });

      // Step 3: Check if room is full
      ErrorLogger.debug('Step 3: Checking room capacity', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'checkCapacity', roomId: room.id });
      const { data: isFull, error: fullCheckError } = await supabase
        .rpc('is_room_full', { room_uuid: room.id });

      if (fullCheckError) {
        const error = new Error(`Failed to check room capacity: ${fullCheckError.message}`);
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id, fullCheckError });
        throw error;
      }

      ErrorLogger.debug('Room full check completed', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'checkCapacity', roomId: room.id, isFull });

      if (isFull) {
        ErrorLogger.warn('Room is at capacity', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'checkCapacity', roomId: room.id });
        showErrorToast(t('study_rooms.room_full'));
        return;
      }
      ErrorLogger.info('Room has space available', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'checkCapacity', roomId: room.id });

      // Step 4: Join room
      ErrorLogger.debug('Step 4: Joining as participant', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'joinParticipant', roomId: room.id });
      const { error: joinError } = await supabase
        .from('study_room_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          is_host: false
        });

      if (joinError) {
        // Check if error is due to room being full or other constraints
        if (joinError.code === '23505' || joinError.message.includes('full') || joinError.message.includes('capacity') || joinError.message.includes('constraint')) {
          showErrorToast('This room is now full. Please try another room.');
          return;
        }
        const error = new Error(`Failed to join room: ${joinError.message}`);
        ErrorLogger.error(error, { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id, errorCode: joinError.code, details: joinError.details });
        throw error;
      }

      ErrorLogger.info('Successfully joined room', { component: 'StudyRoomsPage', action: 'handleJoinRoom', step: 'joinParticipant', roomId: room.id });
      ErrorLogger.debug('Opening room interface with video', { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id });
      setSelectedRoom(room);
      setShowVideo(true);  // Auto-start video immediately
      ErrorLogger.info('Join Complete', { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room.id });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'handleJoinRoom', roomId: room?.id });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // User-friendly error messages
      let userMessage = t('study_rooms.join_failed') || 'Failed to join room';

      if (errorMessage.includes('full')) {
        userMessage = 'This room is full. Please try another room.';
      } else if (errorMessage.includes('profile')) {
        userMessage = 'Please update your profile before joining rooms.';
      } else if (errorMessage.includes('expired') || errorMessage.includes('inactive')) {
        userMessage = 'This room is no longer available.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        userMessage = 'You do not have permission to join this room.';
      }

      showErrorToast(`${userMessage}\n\nTechnical details: ${errorMessage}`);
    } finally {
      setJoiningRoom(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!user || !selectedRoom || leavingRoom) {
      ErrorLogger.debug('Cannot leave: missing user or room or already leaving', { component: 'StudyRoomsPage', action: 'handleLeaveRoom' });
      return;
    }

    if (zegoPollIntervalRef.current) {
      clearInterval(zegoPollIntervalRef.current);
      zegoPollIntervalRef.current = null;
    }
    if (forceLeaveTimeoutRef.current) {
      clearTimeout(forceLeaveTimeoutRef.current);
      forceLeaveTimeoutRef.current = null;
    }
    setCreditsExhaustedCountdown(null);

    setLeavingRoom(true);
    ErrorLogger.debug('Leaving Room', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id, roomName: selectedRoom.room_name, userId: user.id });

    try {
      // Close video first if open
      if (showVideo) {
        ErrorLogger.debug('Closing video', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id });
        setShowVideo(false);
      }

      // Update database to mark as left
      ErrorLogger.debug('Updating participant record', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id });
      const { error } = await supabase
        .from('study_room_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('room_id', selectedRoom.id)
        .eq('user_id', user.id);

      if (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id });
        throw error;
      }

      ErrorLogger.info('Successfully left room', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id });

      // Check if this was the last participant
      ErrorLogger.debug('Checking remaining participant count', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id });
      const { count: remainingCount, error: countError } = await supabase
        .from('study_room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', selectedRoom.id)
        .is('left_at', null);

      if (countError) {
        ErrorLogger.warn('Failed to check participant count', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id, error: countError });
      } else {
        ErrorLogger.debug('Remaining participant count', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id, remainingCount });
        
        if (remainingCount === 0) {
          // Last participant left - end the room
          ErrorLogger.info('Last participant left - ending room', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id });
          const { error: endRoomError } = await supabase
            .from('study_rooms')
            .update({ is_active: false })
            .eq('id', selectedRoom.id);

          if (endRoomError) {
            ErrorLogger.error(endRoomError instanceof Error ? endRoomError : new Error(String(endRoomError)), { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id, step: 'endRoom' });
          } else {
            ErrorLogger.info('Room ended successfully', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom.id });
          }
        }
      }

      // Clear selected room
      setSelectedRoom(null);

      // Refresh room lists
      ErrorLogger.debug('Refreshing room lists', { component: 'StudyRoomsPage', action: 'handleLeaveRoom' });
      await Promise.all([fetchRooms(), fetchMyRooms()]);

      ErrorLogger.info('Leave Complete', { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom?.id });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'handleLeaveRoom', roomId: selectedRoom?.id });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // User-friendly error message
      let userMessage = 'Unable to leave room properly.';

      if (errorMessage.includes('policy') || errorMessage.includes('permission')) {
        userMessage = 'Permission error when leaving room.';
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        userMessage = 'Network error. Please check your connection.';
      }

      showErrorToast(`${userMessage}\n\nTechnical details: ${errorMessage}\n\nThe page will refresh to ensure clean state.`);

      // Refresh to ensure clean state
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!user) return;

    ErrorLogger.debug('Deleting Room', { component: 'StudyRoomsPage', action: 'handleDeleteRoom', roomId });

    const confirmed = await confirm(t('study_rooms.confirm_delete') || 'DELETE this room permanently? This cannot be undone!', {
      title: t('study_rooms.confirm_delete_title') || 'Delete Room',
      variant: 'destructive',
      confirmText: t('study_rooms.delete') || 'Delete',
    });
    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from('study_rooms')
        .delete()
        .eq('id', roomId)
        .eq('creator_id', user.id);

      if (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'handleDeleteRoom', roomId });
        throw error;
      }

      ErrorLogger.info('Room deleted successfully', { component: 'StudyRoomsPage', action: 'handleDeleteRoom', roomId });

      // If currently in this room, leave it
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
        setShowVideo(false);
      }

      // Refresh lists
      await Promise.all([fetchRooms(), fetchMyRooms()]);
      showSuccessToast(t('study_rooms.room_deleted') || 'Room deleted successfully');

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'StudyRoomsPage', action: 'handleDeleteRoom', roomId });
      showErrorToast(t('study_rooms.delete_failed') || 'Failed to delete room');
    }
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const _formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (selectedRoom) {
    return (
      <div className="min-h-screen bg-card-dark p-4">
        <div className="max-w-7xl mx-auto">
          {/* Active room header — Scholar v4 dark bar style */}
          <div className="mb-4 flex justify-between items-center bg-[#1a1a1a] border-b border-white/[.08] px-5 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-[7px] h-[7px] rounded-full bg-accent-gold inline-block" />
                <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-accent-gold">Live</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div>
                <h2 className="font-display text-[13px] font-semibold text-ink-on-dark leading-none">
                  {selectedRoom.room_name}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-ink-on-dark/50">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {participants.length}/{selectedRoom.max_participants}
                  </span>
                  <button
                    onClick={() => copyRoomCode(selectedRoom.room_code)}
                    className="flex items-center gap-1 hover:text-ink-on-dark/80 transition-colors font-mono"
                  >
                    {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {selectedRoom.room_code}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold text-[13px] flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              <span>{t('study_rooms.leave_room') || 'Leave Room'}</span>
            </button>
          </div>

          {creditsExhaustedCountdown != null && creditsExhaustedCountdown > 0 && (
            <div className="mb-4 bg-amber-600 text-white px-4 py-3 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span>{t('study_rooms.credits_exhausted_warning') || 'Study room credits exhausted. You will be removed in 30 seconds.'}</span>
              <span className="font-bold">{creditsExhaustedCountdown}s</span>
            </div>
          )}

          {/* Full-screen ZegoCloud video interface */}
          <div className="bg-[#111] overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
            <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" /></div>}>
              <ZegoVideoRoom
                roomId={selectedRoom.room_code}
                roomName={selectedRoom.room_name}
                userName={userDisplayName || user?.email?.split('@')[0] || 'Anonymous'}
                onDisconnect={handleLeaveRoom}
                floatingRoomMeta={{
                  id: selectedRoom.id,
                  room_code: selectedRoom.room_code,
                  name: selectedRoom.room_name,
                  description: selectedRoom.room_description,
                  max_participants: selectedRoom.max_participants,
                }}
              />
            </React.Suspense>
          </div>
        </div>
      </div>
    );
  }

  const studyRoomsTabs: SectionTab[] = [
    { id: 'browse', label: t('study_rooms.browse') },
    { id: 'my-rooms', label: t('study_rooms.my_rooms'), count: myRooms.length },
    { id: 'create', label: t('study_rooms.create') },
    { id: 'friends', label: t('social.tab_friends') },
    { id: 'groups', label: t('social.tab_groups') },
    { id: 'group-chat', label: 'Group Chat' },
  ];

  const handleStudyRoomsTabChange = (id: string) => {
    if (id === 'friends' || id === 'groups') {
      handleSocialTabClick(id as 'friends' | 'groups');
    } else {
      setActiveTab(id as typeof activeTab);
    }
  };

  // For tab-active styling, treat 'group-chat' as 'group-chat' directly.
  const activeStudyRoomsTabId = activeTab;

  return (
    <div className="w-full">
        <PageHeader
          eyebrow={t('study_rooms.eyebrow') || 'MeshFahem · Live'}
          title={t('study_rooms.title')}
          descriptor={t('study_rooms.page_description') || 'Collaborate live with peers. Join a session or start your own.'}
          className="mb-5"
          actions={
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-2 px-[18px] py-[9px] bg-sidebar text-ink-on-dark font-display text-[13px] font-semibold cursor-pointer border-none"
            >
              + {t('study_rooms.create_room') || 'Create Room'}
            </button>
          }
        />

        <div className="mb-4">
          <SectionTabs
            tabs={studyRoomsTabs}
            activeId={activeStudyRoomsTabId}
            onChange={handleStudyRoomsTabChange}
            ariaLabel={t('study_rooms.title')}
          />
        </div>

        {activeTab === 'create' && (
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark" style={{ padding: '26px 30px' }}>
            <div className="text-[9px] tracking-[0.25em] uppercase text-accent-gold font-bold mb-5">
              {t('study_rooms.create_new') || 'New Room'}
            </div>

            {/* Room name */}
            <div className="mb-[22px]">
              <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-[6px]">{t('study_rooms.room_name')}</div>
              <div className="border-b border-ink dark:border-ink-on-dark pb-2">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={t('study_rooms.room_name_placeholder') || 'Name your room…'}
                  maxLength={100}
                  className="w-full bg-transparent font-display text-[20px] text-ink dark:text-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none"
                />
              </div>
            </div>

            {/* Course */}
            <div className="mb-[22px]">
              <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-[6px]">Course</div>
              <div className="flex justify-between items-center px-3 py-2 bg-subtle dark:bg-card-dark border border-divider dark:border-divider-on-dark">
                <span className="text-[13px] text-ink dark:text-ink-on-dark">Calculus II</span>
                <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">▾</span>
              </div>
            </div>

            {/* When */}
            <div className="mb-[22px]">
              <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-2">When</div>
              <div className="flex gap-[10px] mb-3">
                {(['Start now', 'Schedule for later'] as const).map((label) => {
                  const active = (label === 'Start now' && whenMode === 'now') || (label === 'Schedule for later' && whenMode === 'later');
                  return (
                    <div
                      key={label}
                      onClick={() => setWhenMode(label === 'Start now' ? 'now' : 'later')}
                      className={`px-4 py-[7px] text-[12px] cursor-pointer transition-colors ${
                        active
                          ? 'border-2 border-accent-gold bg-accent-gold-soft text-accent-gold font-semibold'
                          : 'border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark'
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
              {whenMode === 'later' && (
                <div className="grid grid-cols-2 gap-3">
                  {[['Date', 'Wednesday, May 8'], ['Time', '8:00 PM']].map(([label, val]) => (
                    <div key={label}>
                      <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mb-[5px]">{label}</div>
                      <div className="flex justify-between items-center px-3 py-[7px] bg-subtle dark:bg-card-dark border border-divider dark:border-divider-on-dark">
                        <span className="text-[12px] text-ink dark:text-ink-on-dark">{val}</span>
                        <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">▾</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy */}
            <div className="mb-[22px]">
              <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-2">Privacy</div>
              <div className="flex gap-[10px]">
                {(['Private with link', 'Public'] as const).map((label, i) => (
                  <div
                    key={label}
                    className={`px-4 py-[7px] text-[12px] cursor-pointer transition-colors ${
                      i === 0
                        ? 'border-2 border-accent-gold bg-accent-gold-soft text-accent-gold font-semibold'
                        : 'border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Tools grid — 9 cols */}
            <div className="mb-[22px]">
              <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-3">Tools in this room</div>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
                {ROOM_TOOLS.map((tool) => {
                  const on = toolsEnabled[tool];
                  return (
                    <div
                      key={tool}
                      onClick={() => setToolsEnabled(prev => ({ ...prev, [tool]: !prev[tool] }))}
                      className={`flex flex-col items-center gap-[6px] py-[10px] px-[6px] cursor-pointer transition-colors ${
                        on ? 'border-2 border-accent-gold bg-accent-gold-soft' : 'border border-divider dark:border-divider-on-dark'
                      }`}
                    >
                      <div
                        className="w-[14px] h-[14px] flex-shrink-0"
                        style={{ background: on ? 'var(--color-accent-gold)' : 'var(--color-divider)' }}
                      />
                      <span
                        className="text-[9px] text-center leading-tight"
                        style={{ color: on ? 'var(--color-accent-gold)' : undefined, fontWeight: on ? 700 : 400 }}
                      >
                        {tool}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite link */}
            <div className="mb-5">
              <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-[10px]">Invite link</div>
              <div className="flex border border-divider dark:border-divider-on-dark">
                <div className="flex-1 px-3 py-[9px] text-[12px] text-muted-ink dark:text-muted-ink-on-dark bg-subtle dark:bg-card-dark">
                  meshfahem.app/rooms/invite/s8kxq7
                </div>
                <button type="button" className="px-4 py-[9px] bg-sidebar text-ink-on-dark text-[12px] font-semibold">
                  Copy
                </button>
              </div>
              <div className="flex gap-2 mt-[10px] flex-wrap">
                {['Layla A.', 'Karim H.', 'Reem S.'].map((name) => (
                  <div key={name} className="inline-flex items-center gap-[6px] px-[10px] py-1 border border-divider dark:border-divider-on-dark text-[11px] text-ink dark:text-ink-on-dark bg-subtle dark:bg-card-dark">
                    <div className="w-4 h-4 rounded-full bg-accent-gold flex items-center justify-center text-[8px] font-bold text-sidebar flex-shrink-0">
                      {name[0]}
                    </div>
                    {name}
                    <span className="text-muted-ink dark:text-muted-ink-on-dark cursor-pointer">×</span>
                  </div>
                ))}
                <div className="inline-flex items-center px-[10px] py-1 border border-dashed border-divider dark:border-divider-on-dark text-[11px] text-muted-ink dark:text-muted-ink-on-dark cursor-pointer">
                  + Invite someone
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="px-[18px] py-[9px] bg-transparent border border-divider dark:border-divider-on-dark text-[13px] text-ink dark:text-ink-on-dark cursor-pointer"
              >
                {t('study_rooms.cancel') || 'Cancel'}
              </button>
              <ScholarButton
                variant="primary"
                size="md"
                loading={creating}
                loadingText={t('study_rooms.creating') || 'Creating…'}
                onClick={handleCreateRoom}
                disabled={creating || !roomName.trim()}
                className="font-display"
              >
                Send the invitation →
              </ScholarButton>
            </div>
          </div>
        )}

        {(activeTab === 'browse' || activeTab === 'my-rooms') && (
          <div className="space-y-5">
            {/* Search bar — v4 panel style */}
            {activeTab === 'browse' && (
              <div className="flex items-center gap-[10px] px-[14px] py-[9px] bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark mb-[22px]">
                <Search className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0" aria-hidden />
                <input
                  type="search"
                  value={browseSearchQuery}
                  onChange={(e) => setBrowseSearchQuery(e.target.value)}
                  placeholder={t('study_rooms.browse_search_placeholder')}
                  className="flex-1 bg-transparent text-[13px] text-muted-ink dark:text-muted-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none"
                  aria-label={t('study_rooms.browse_search_placeholder')}
                />
              </div>
            )}

            {/* Section heading row */}
            {!loading && displayRoomList.length > 0 && (
              <div className="flex items-center gap-[10px] mb-3">
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-accent-gold">
                  {activeTab === 'browse' ? 'Live Now' : t('study_rooms.my_rooms')}
                </span>
                <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">· {displayRoomList.length} rooms</span>
                <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
                <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">
                  {activeTab === 'browse' ? 'most active' : 'recent'}
                </span>
              </div>
            )}

            {loading ? (
              <LoadingSkeleton type="card" count={3} />
            ) : browseSearchNoMatches ? (
              <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center">
                <Search className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4 opacity-40" />
                <p className="text-secondary-ink dark:text-muted-ink-on-dark text-sm">{t('study_rooms.browse_no_matches')}</p>
              </div>
            ) : displayRoomList.length === 0 ? (
              <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center">
                <Users className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4 opacity-40" />
                <p className="text-secondary-ink dark:text-muted-ink-on-dark mb-1">
                  {activeTab === 'browse' ? t('study_rooms.no_active_rooms') : t('study_rooms.no_rooms_yet')}
                </p>
                <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                  {activeTab === 'browse' ? t('study_rooms.create_to_start') : t('study_rooms.create_first_room')}
                </p>
              </div>
            ) : (
              /* 3-col card grid matching Rooms4 layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
                {displayRoomList.map((room) => {
                  const isFull = (room.participant_count || 0) >= room.max_participants;
                  const n = room.participant_count || 0;
                  const avatarLetters = Array.from({ length: Math.min(n, 4) }, (_, i) => String.fromCharCode(65 + (i % 26)));
                  const avatarPalette = ['var(--color-accent-gold)','var(--color-secondary-ink)','var(--color-sidebar)','var(--color-muted-ink)'];
                  return (
                    <div key={room.id} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark flex flex-col">
                      {/* Card header — dark ink strip */}
                      <div className="bg-sidebar px-[14px] py-[11px] flex justify-between items-center">
                        <div className="text-[9.5px] tracking-[1.5px] uppercase font-bold text-accent-gold truncate max-w-[140px]">
                          {room.room_description || 'Study Room'}
                        </div>
                        <div className="inline-flex items-center gap-[5px] px-[9px] py-[3px] bg-accent-gold text-[9px] tracking-[1.5px] uppercase font-bold text-ink-on-dark">
                          <div className="w-1 h-1 rounded-full bg-ink-on-dark flex-shrink-0" />
                          Live
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="px-[16px] py-[14px] flex-1 flex flex-col gap-[9px]">
                        <div>
                          <h3 className="font-display text-[17px] font-semibold text-ink dark:text-ink-on-dark leading-tight mb-[3px]">
                            {room.room_name}.
                          </h3>
                        </div>
                        {room.room_description && (
                          <p className="text-[12.5px] text-secondary-ink dark:text-muted-ink-on-dark leading-relaxed line-clamp-2">
                            {room.room_description}
                          </p>
                        )}
                        <div className="flex gap-[5px] flex-wrap">
                          <span className="text-[9px] tracking-[1.2px] text-muted-ink dark:text-muted-ink-on-dark font-bold px-[7px] py-[2px] border border-divider dark:border-divider-on-dark uppercase">
                            Video
                          </span>
                          <span className="text-[9px] tracking-[1.2px] text-muted-ink dark:text-muted-ink-on-dark font-bold px-[7px] py-[2px] border border-divider dark:border-divider-on-dark uppercase">
                            Chat
                          </span>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="px-[16px] py-[10px] border-t border-divider dark:border-divider-on-dark flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Avatar stack */}
                          <div className="flex">
                            {avatarLetters.map((letter, i) => (
                              <div
                                key={i}
                                className="w-[22px] h-[22px] rounded-full grid place-items-center text-[9.5px] font-bold text-ink-on-dark border-2 border-ink-on-dark flex-shrink-0"
                                style={{ background: avatarPalette[i % avatarPalette.length], marginLeft: i ? '-7px' : '0' }}
                              >
                                {letter}
                              </div>
                            ))}
                          </div>
                          <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{n} / {room.max_participants}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeTab === 'my-rooms' && room.creator_id === user?.id && (
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                              title={t('study_rooms.delete_room') || 'Delete Room'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleJoinRoom(room)}
                            disabled={isFull}
                            className="px-[14px] py-[6px] bg-accent-gold text-ink-on-dark font-display text-[12px] font-semibold border-none cursor-pointer disabled:opacity-50 transition-opacity"
                          >
                            {isFull ? 'Full' : 'Join Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'friends' && <FriendsPanel />}

        {activeTab === 'groups' && (
          <GroupsPanel onOpenGroupChat={handleOpenGroupChat} />
        )}

        {activeTab === 'group-chat' && activeGroupChat && (
          <GroupChat
            groupId={activeGroupChat.groupId}
            groupName={activeGroupChat.groupName}
            onBack={() => setActiveTab('groups')}
          />
        )}

      <UsernameSetupModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onComplete={(username) => {
          setHasUsername(true);
          setShowUsernameModal(false);
          showSuccessToast(`Username @${username} saved!`);
        }}
      />

      {ConfirmModal}

      {/* Study Rooms Tutorial */}
      {tutorialConfig && (
        <PageTutorial
          config={tutorialConfig}
          isOpen={isTutorialOpen}
          onClose={() => {}}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </div>
  );
};
