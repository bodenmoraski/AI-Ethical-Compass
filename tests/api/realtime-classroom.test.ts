import '../setup';

// Mock Supabase real-time client
const mockRealtimeChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
  unsubscribe: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

const mockSupabaseRealtime = {
  channel: jest.fn().mockReturnValue(mockRealtimeChannel),
  removeAllChannels: jest.fn(),
};

jest.mock('../../lib/supabase-client', () => ({
  supabase: {
    ...mockSupabaseRealtime,
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));

describe('Real-time Classroom Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Live Discussion Updates', () => {
    it('should subscribe to discussion post updates for a class', async () => {
      const classId = 1;
      const { subscribeToDiscussionUpdates } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      subscribeToDiscussionUpdates(classId, mockCallback);

      expect(mockSupabaseRealtime.channel).toHaveBeenCalledWith(`class-${classId}-discussions`);
      expect(mockRealtimeChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'discussion_posts',
          filter: `thread_id=in.(select id from discussion_threads where class_id=eq.${classId})`,
        }),
        expect.any(Function)
      );
      expect(mockRealtimeChannel.subscribe).toHaveBeenCalled();
    });

    it('should handle new discussion post events', async () => {
      const { subscribeToDiscussionUpdates } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const mockNewPost = {
        id: 1,
        content: 'This is a new discussion post',
        author_id: 2,
        thread_id: 1,
        created_at: new Date().toISOString(),
      };

      subscribeToDiscussionUpdates(1, mockCallback);

      // Simulate receiving a new post
      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'INSERT',
        new: mockNewPost,
        old: null,
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'NEW_POST',
        data: mockNewPost,
      });
    });

    it('should handle post update events', async () => {
      const { subscribeToDiscussionUpdates } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const mockUpdatedPost = {
        id: 1,
        content: 'This post has been updated',
        author_id: 2,
        thread_id: 1,
        updated_at: new Date().toISOString(),
      };

      subscribeToDiscussionUpdates(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'UPDATE',
        new: mockUpdatedPost,
        old: { ...mockUpdatedPost, content: 'Original content' },
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'POST_UPDATED',
        data: mockUpdatedPost,
      });
    });

    it('should handle moderation status changes', async () => {
      const { subscribeToDiscussionUpdates } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const moderatedPost = {
        id: 1,
        content: 'Post content',
        moderation_status: 'flagged',
        author_id: 2,
        thread_id: 1,
      };

      subscribeToDiscussionUpdates(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'UPDATE',
        new: moderatedPost,
        old: { ...moderatedPost, moderation_status: 'approved' },
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'MODERATION_UPDATE',
        data: moderatedPost,
      });
    });
  });

  describe('Live Assignment Submissions', () => {
    it('should subscribe to assignment submission updates', async () => {
      const assignmentId = 1;
      const { subscribeToAssignmentSubmissions } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      subscribeToAssignmentSubmissions(assignmentId, mockCallback);

      expect(mockSupabaseRealtime.channel).toHaveBeenCalledWith(`assignment-${assignmentId}-submissions`);
      expect(mockRealtimeChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'assignment_submissions',
          filter: `assignment_id=eq.${assignmentId}`,
        }),
        expect.any(Function)
      );
    });

    it('should notify of new submissions', async () => {
      const { subscribeToAssignmentSubmissions } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const newSubmission = {
        id: 1,
        assignment_id: 1,
        student_id: 2,
        submission_data: { answers: ['Answer 1', 'Answer 2'] },
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      };

      subscribeToAssignmentSubmissions(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'INSERT',
        new: newSubmission,
        old: null,
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'NEW_SUBMISSION',
        data: newSubmission,
      });
    });

    it('should notify of grading updates', async () => {
      const { subscribeToAssignmentSubmissions } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const gradedSubmission = {
        id: 1,
        assignment_id: 1,
        student_id: 2,
        final_score: 85,
        feedback: 'Good work!',
        status: 'graded',
        graded_at: new Date().toISOString(),
        graded_by: 1,
      };

      subscribeToAssignmentSubmissions(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'UPDATE',
        new: gradedSubmission,
        old: { ...gradedSubmission, status: 'submitted', final_score: null },
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'SUBMISSION_GRADED',
        data: gradedSubmission,
      });
    });
  });

  describe('Live Student Engagement Tracking', () => {
    it('should subscribe to student engagement updates for a class', async () => {
      const classId = 1;
      const { subscribeToStudentEngagement } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      subscribeToStudentEngagement(classId, mockCallback);

      expect(mockSupabaseRealtime.channel).toHaveBeenCalledWith(`class-${classId}-engagement`);
      expect(mockRealtimeChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'student_engagement',
          filter: `class_id=eq.${classId}`,
        }),
        expect.any(Function)
      );
    });

    it('should track live student activity', async () => {
      const { subscribeToStudentEngagement } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const engagementUpdate = {
        id: 1,
        student_id: 2,
        class_id: 1,
        scenario_id: 1,
        session_start: new Date().toISOString(),
        time_spent_seconds: 120,
        actions_taken: [
          { action: 'view_scenario', timestamp: new Date().toISOString() },
          { action: 'submit_perspective', timestamp: new Date().toISOString() },
        ],
        engagement_score: 0.85,
      };

      subscribeToStudentEngagement(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'UPDATE',
        new: engagementUpdate,
        old: { ...engagementUpdate, time_spent_seconds: 60 },
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'ENGAGEMENT_UPDATE',
        data: engagementUpdate,
      });
    });

    it('should detect student presence in class', async () => {
      const { subscribeToStudentEngagement } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const presenceUpdate = {
        id: 1,
        student_id: 2,
        class_id: 1,
        session_start: new Date().toISOString(),
        is_active: true,
      };

      subscribeToStudentEngagement(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'INSERT',
        new: presenceUpdate,
        old: null,
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'STUDENT_ACTIVE',
        data: presenceUpdate,
      });
    });
  });

  describe('Live Notifications', () => {
    it('should subscribe to notifications for a user', async () => {
      const userId = 1;
      const { subscribeToNotifications } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      subscribeToNotifications(userId, mockCallback);

      expect(mockSupabaseRealtime.channel).toHaveBeenCalledWith(`user-${userId}-notifications`);
      expect(mockRealtimeChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        }),
        expect.any(Function)
      );
    });

    it('should handle new notification events', async () => {
      const { subscribeToNotifications } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const newNotification = {
        id: 1,
        recipient_id: 1,
        sender_id: 2,
        type: 'assignment_due',
        title: 'Assignment Due Tomorrow',
        message: 'Your ethics assignment is due tomorrow at 11:59 PM',
        data: { assignment_id: 1, class_id: 1 },
        is_read: false,
        created_at: new Date().toISOString(),
      };

      subscribeToNotifications(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'INSERT',
        new: newNotification,
        old: null,
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'NEW_NOTIFICATION',
        data: newNotification,
      });
    });

    it('should handle notification read status updates', async () => {
      const { subscribeToNotifications } = await import('../../api/realtime-classroom');
      
      const mockCallback = jest.fn();
      const readNotification = {
        id: 1,
        recipient_id: 1,
        is_read: true,
        updated_at: new Date().toISOString(),
      };

      subscribeToNotifications(1, mockCallback);

      const onHandler = mockRealtimeChannel.on.mock.calls[0][2];
      onHandler({
        eventType: 'UPDATE',
        new: readNotification,
        old: { ...readNotification, is_read: false },
      });

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'NOTIFICATION_READ',
        data: readNotification,
      });
    });
  });

  describe('Connection Management', () => {
    it('should unsubscribe from all channels', async () => {
      const { unsubscribeFromAll } = await import('../../api/realtime-classroom');
      
      unsubscribeFromAll();

      expect(mockSupabaseRealtime.removeAllChannels).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      const { subscribeToDiscussionUpdates } = await import('../../api/realtime-classroom');
      
      mockRealtimeChannel.subscribe.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const mockCallback = jest.fn();
      const mockErrorHandler = jest.fn();

      expect(() => {
        subscribeToDiscussionUpdates(1, mockCallback, mockErrorHandler);
      }).not.toThrow();

      expect(mockErrorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should retry failed connections', async () => {
      const { subscribeToDiscussionUpdates } = await import('../../api/realtime-classroom');
      
      let subscribeCallCount = 0;
      mockRealtimeChannel.subscribe.mockImplementation(() => {
        subscribeCallCount++;
        if (subscribeCallCount === 1) {
          throw new Error('Connection failed');
        }
        return 'SUBSCRIBED';
      });

      const mockCallback = jest.fn();
      subscribeToDiscussionUpdates(1, mockCallback);

      // Wait for retry
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockRealtimeChannel.subscribe).toHaveBeenCalledTimes(2);
    });
  });
}); 