import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  Loader2Icon,
  LogOutIcon,
  PhoneOffIcon,
  LockIcon,
  CopyIcon,
  CheckIcon,
  InfoIcon,
  UsersIcon,
} from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import InterviewFeedbackModal from "../components/InterviewFeedbackModal";
import toast from "react-hot-toast";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [copiedField, setCopiedField] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { data: sessionData, isLoading: loadingSession, isError: sessionError, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participants?.some((p) => p.clerkId === user?.id);
  const isUserAuthorized = isHost || isParticipant;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  useEffect(() => {
    if (!session || loadingSession) return;
    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    setShowFeedbackModal(true);
  };

  const handleJoinWithPassword = () => {
    if (!roomPassword || !session?.meetingId) return;
    joinSessionMutation.mutate(
      { meetingId: session.meetingId, password: roomPassword },
      { onSuccess: () => { setRoomPassword(""); refetch(); } }
    );
  };

  const handleCopy = async (value, field) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Loading state
  if (loadingSession) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError || (!loadingSession && !session)) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-base-200 shadow-xl w-full max-w-md">
            <div className="card-body items-center text-center">
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
                <PhoneOffIcon className="w-10 h-10 text-error" />
              </div>
              <h2 className="card-title text-2xl mb-1">Session Not Found</h2>
              <p className="text-base-content/60 mb-4">
                This session doesn't exist or the link is invalid.
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
                Go Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Password gatekeeper
  if (!isUserAuthorized) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-base-200 shadow-xl w-full max-w-md">
            <div className="card-body items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <LockIcon className="w-10 h-10 text-primary" />
              </div>
              <h2 className="card-title text-2xl mb-1">Enter Room Password</h2>
              <p className="text-base-content/60 mb-4">
                This room is password-protected. Enter the password to join.
              </p>
              <div className="w-full space-y-4">
                <input
                  type="text"
                  placeholder="Enter password"
                  className="input input-bordered w-full text-center text-lg tracking-widest"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinWithPassword()}
                />
                <button
                  className="btn btn-primary btn-block gap-2"
                  onClick={handleJoinWithPassword}
                  disabled={joinSessionMutation.isPending || !roomPassword}
                >
                  {joinSessionMutation.isPending ? (
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                  ) : (
                    <LockIcon className="w-5 h-5" />
                  )}
                  {joinSessionMutation.isPending ? "Joining..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== AUTHORIZED — Fixed split-screen layout =====
  return (
    <div className="h-screen bg-base-100 flex flex-col">
      {/* TOP BAR — Session info + Meeting credentials + Controls */}
      <div className="bg-base-200 border-b border-base-300 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold truncate">
            {session?.problem || "Instant Meeting"}
          </h1>
          {session?.difficulty && (
            <span className={`badge badge-sm ${getDifficultyBadgeClass(session?.difficulty)}`}>
              {session.difficulty.slice(0, 1).toUpperCase() + session.difficulty.slice(1)}
            </span>
          )}
          <div className="flex items-center gap-1 text-base-content/60 text-sm">
            <UsersIcon className="w-4 h-4" />
            <span>{(session?.participants?.length || 0) + 1} participants</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Meeting Info dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
              <InfoIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Meeting Info</span>
            </label>
            <div
              tabIndex={0}
              className="dropdown-content z-50 card card-compact bg-base-100 shadow-xl border border-base-300 w-72 mt-2"
            >
              <div className="card-body">
                <h3 className="font-bold text-sm mb-2">Room Credentials</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-xs text-base-content/50">Meeting ID</p>
                      <p className="font-mono font-bold text-sm">{session?.meetingId}</p>
                    </div>
                    <button className="btn btn-ghost btn-xs" onClick={() => handleCopy(session?.meetingId, "meetingId")}>
                      {copiedField === "meetingId" ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-xs text-base-content/50">Password</p>
                      <p className="font-mono font-bold text-sm">{session?.password}</p>
                    </div>
                    <button className="btn btn-ghost btn-xs" onClick={() => handleCopy(session?.password, "password")}>
                      {copiedField === "password" ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-base-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-base-content/50">Host</p>
                    <p className="font-bold text-sm">{session?.host?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* End Session */}
          {isHost && session?.status === "active" && (
            <button
              onClick={handleEndSession}
              disabled={endSessionMutation.isPending}
              className="btn btn-error btn-sm gap-2"
            >
              {endSessionMutation.isPending ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <LogOutIcon className="w-4 h-4" />
              )}
              End Session
            </button>
          )}
          {session?.status === "completed" && (
            <span className="badge badge-ghost badge-lg">Completed</span>
          )}
        </div>
      </div>

      {/* FIXED SPLIT-SCREEN: Code Editor (left) | Video Call (right) */}
      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          {/* LEFT — Code Editor + Problem + Output */}
          <Panel defaultSize={45} minSize={25}>
            <PanelGroup direction="vertical">
              {/* Problem Description */}
              {problemData && (
                <>
                  <Panel defaultSize={35} minSize={15}>
                    <div className="h-full overflow-y-auto bg-base-200">
                      <div className="p-4 space-y-4">
                        {problemData?.description && (
                          <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-300">
                            <h2 className="text-lg font-bold mb-3">Description</h2>
                            <div className="space-y-2 text-sm leading-relaxed">
                              <p className="text-base-content/90">{problemData.description.text}</p>
                              {problemData.description.notes?.map((note, idx) => (
                                <p key={idx} className="text-base-content/90">{note}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        {problemData?.examples?.length > 0 && (
                          <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-300">
                            <h2 className="text-lg font-bold mb-3">Examples</h2>
                            <div className="space-y-3">
                              {problemData.examples.map((example, idx) => (
                                <div key={idx}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="badge badge-sm">{idx + 1}</span>
                                    <p className="font-semibold text-sm">Example {idx + 1}</p>
                                  </div>
                                  <div className="bg-base-200 rounded-lg p-3 font-mono text-xs space-y-1">
                                    <div className="flex gap-2">
                                      <span className="text-primary font-bold min-w-[55px]">Input:</span>
                                      <span>{example.input}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="text-secondary font-bold min-w-[55px]">Output:</span>
                                      <span>{example.output}</span>
                                    </div>
                                    {example.explanation && (
                                      <div className="pt-1.5 border-t border-base-300 mt-1.5">
                                        <span className="text-base-content/60 font-sans text-xs">
                                          <span className="font-semibold">Explanation:</span> {example.explanation}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {problemData?.constraints?.length > 0 && (
                          <div className="bg-base-100 rounded-xl shadow-sm p-4 border border-base-300">
                            <h2 className="text-lg font-bold mb-3">Constraints</h2>
                            <ul className="space-y-1 text-sm">
                              {problemData.constraints.map((c, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-primary">•</span>
                                  <code className="text-xs">{c}</code>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </Panel>
                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />
                </>
              )}

              {/* Code Editor */}
              <Panel defaultSize={problemData ? 45 : 70} minSize={25}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={(value) => setCode(value)}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Output */}
              <Panel defaultSize={problemData ? 20 : 30} minSize={10}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT — Video Call */}
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full bg-base-200 p-3 overflow-hidden">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">Unable to connect to the video call</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Interview Feedback Modal */}
      <InterviewFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        sessionId={id}
        code={code}
        call={call}
        endSessionMutation={endSessionMutation}
        navigate={navigate}
      />
    </div>
  );
}

export default SessionPage;
