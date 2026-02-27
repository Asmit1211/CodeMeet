import {
  CallControls,
  CallingState,
  SpeakerLayout,
  ParticipantView,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

// TrackType.SCREEN_SHARE = 3 (from @stream-io/video-client SFU protobuf enum)
const TRACK_TYPE_SCREEN_SHARE = 3;

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  // NOTE: No useCall() hook — we do NOT call call.setViewport() or any
  // programmatic screen share methods. Only the SDK's built-in <CallControls>
  // screen share button can trigger sharing via user click.
  const { useCallCallingState, useParticipantCount, useRemoteParticipants, useLocalParticipant } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const remoteParticipants = useRemoteParticipants();
  const localParticipant = useLocalParticipant();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // All participants, local first
  const allParticipants = useMemo(() => {
    const list = [];
    if (localParticipant) list.push(localParticipant);
    list.push(...remoteParticipants);
    return list;
  }, [localParticipant, remoteParticipants]);

  // Detect if ANYONE is screen sharing via publishedTracks.
  // This is READ-ONLY detection — no side effects, no auto-triggering.
  const hasActiveScreenShare = useMemo(() => {
    return allParticipants.some(
      (p) => p.publishedTracks && p.publishedTracks.includes(TRACK_TYPE_SCREEN_SHARE)
    );
  }, [allParticipants]);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", gap: "12px", position: "relative" }}
         className="str-video">

      {/* CSS overrides only for the custom 2x2 grid mode */}
      <style>{`
        .vid-cell {
          position: relative;
          background: #1a1a2e;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .vid-cell .str-video__participant-view {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
        .vid-cell video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        .vid-cell .str-video__video-placeholder {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>

        {/* Header */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow"
             style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {participantCount} {participantCount === 1 ? "participant" : "participants"}
            </span>
            {hasActiveScreenShare && (
              <span className="badge badge-warning badge-sm animate-pulse">🖥 Screen Sharing</span>
            )}
          </div>
          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
            >
              <MessageSquareIcon className="size-4" />
              Chat
            </button>
          )}
        </div>

        {/* VIDEO AREA */}
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {hasActiveScreenShare ? (
            /* ===== SCREEN SHARE MODE =====
               Use the SDK's own <SpeakerLayout /> which:
               1. Internally calls call.setViewport() safely
               2. Handles screen share track subscription automatically
               3. Renders shared screen as the spotlight (large)
               4. Shows other participants in a filmstrip
               5. Does NOT trigger any screen sharing on subscribers
               This is the exact same approach the tutorial used. */
            <div style={{ position: "absolute", inset: 0 }}>
              <SpeakerLayout
                participantsBarPosition="right"
                participantsBarLimit="dynamic"
              />
            </div>
          ) : (
            /* ===== NORMAL MODE: Custom 2x2 Grid =====
               No screen share active — show our clean grid layout. */
            <div style={{
              display: "grid",
              gridTemplateColumns: allParticipants.length <= 1 ? "1fr" : "1fr 1fr",
              gridTemplateRows: allParticipants.length <= 2 ? "1fr" : "1fr 1fr",
              gap: "8px",
              width: "100%",
              height: "100%",
            }}>
              {allParticipants.map((p) => (
                <div key={p.sessionId} className="vid-cell">
                  <ParticipantView
                    participant={p}
                    muteAudio={p === localParticipant}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call controls — ONLY source of screen share trigger (user click) */}
        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center"
             style={{ flexShrink: 0 }}>
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {/* CHAT SIDEBAR */}
      {chatClient && channel && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: "0.5rem",
          overflow: "hidden",
          background: "#272a30",
          transition: "all 300ms ease-in-out",
          width: isChatOpen ? "320px" : "0px",
          opacity: isChatOpen ? 1 : 0,
          flexShrink: 0,
        }}>
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }} className="stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
export default VideoCallUI;
