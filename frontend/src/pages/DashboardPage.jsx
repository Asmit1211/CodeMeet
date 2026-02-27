import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useActiveSessions, useCreateSession, useJoinSession, useMyRecentSessions } from "../hooks/useSessions";
import { userApi } from "../api/users";
import { LogInIcon, LoaderIcon, HashIcon, KeyRoundIcon, VideoIcon } from "lucide-react";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import InterviewTips from "../components/InterviewTips";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

  // Join meeting state
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const createSessionMutation = useCreateSession();
  const joinSessionMutation = useJoinSession();

  // Sync user to MongoDB on first visit
  const syncUserMutation = useMutation({
    mutationFn: userApi.syncUser,
    onSuccess: (data) => {
      if (data.synced) {
        console.log("User synced to MongoDB successfully");
      }
    },
    onError: (error) => {
      console.error("Failed to sync user:", error);
    },
  });

  useEffect(() => {
    if (user) {
      syncUserMutation.mutate();
    }
  }, [user]);

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  const handleCreateRoom = () => {
    createSessionMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          setCreatedSession({
            meetingId: data.meetingId,
            password: data.password,
            sessionId: data.session._id,
          });
        },
      }
    );
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreatedSession(null);
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (!joinMeetingId || !joinPassword) return;

    joinSessionMutation.mutate(
      { meetingId: joinMeetingId, password: joinPassword },
      {
        onSuccess: (data) => {
          setJoinMeetingId("");
          setJoinPassword("");
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return session.host?.clerkId === user.id || session.participants?.some((p) => p.clerkId === user.id);
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        {/* Grid layout */}
        <div className="container mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />

            {/* Join Meeting Card */}
            <div className="card bg-base-100 shadow-xl border border-primary/20 hover:border-primary/40 transition-colors duration-300 h-full">
              <div className="card-body justify-between">
                <div>
                  <h2 className="card-title text-xl gap-2 mb-1">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <VideoIcon className="w-6 h-6 text-primary" />
                    </div>
                    Join Meeting
                  </h2>
                  <p className="text-base-content/60 text-sm">
                    Enter a Meeting ID and Password to join an existing interview room.
                  </p>
                </div>

                <form onSubmit={handleJoinMeeting} className="space-y-4 mt-4">
                  <label className="input input-bordered input-lg flex items-center gap-3 w-full">
                    <HashIcon className="w-5 h-5 text-base-content/40 shrink-0" />
                    <input
                      type="text"
                      placeholder="Meeting ID (e.g. 123-456-789)"
                      className="grow text-base"
                      value={joinMeetingId}
                      onChange={(e) => setJoinMeetingId(e.target.value)}
                    />
                  </label>
                  <label className="input input-bordered input-lg flex items-center gap-3 w-full">
                    <KeyRoundIcon className="w-5 h-5 text-base-content/40 shrink-0" />
                    <input
                      type="text"
                      placeholder="Password"
                      className="grow text-base"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block gap-2 text-base"
                    disabled={joinSessionMutation.isPending || !joinMeetingId || !joinPassword}
                  >
                    {joinSessionMutation.isPending ? (
                      <LoaderIcon className="size-5 animate-spin" />
                    ) : (
                      <LogInIcon className="size-5" />
                    )}
                    {joinSessionMutation.isPending ? "Joining..." : "Join Meeting"}
                  </button>
                </form>

                <p className="text-xs text-base-content/40 text-center mt-2">
                  Ask the host for the credentials to join their session.
                </p>
              </div>
            </div>

            {/* Interview Pro Tips Card — Col 3 */}
            <InterviewTips />
          </div>

          {/* Active Sessions — full-width row below the 3-column grid */}
          <div className="mt-6">
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
        createdSession={createdSession}
      />
    </>
  );
}

export default DashboardPage;
