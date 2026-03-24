import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;
    let cancelled = false;
    let retryTimer = null;

    const initCall = async (attempt = 1) => {
      const MAX_RETRIES = 3;

      if (!session?.callId) return;
      if (!isHost && !isParticipant) return;
      if (session.status === "completed") return;

      try {
        setConnectionError(null);

        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

        if (cancelled) return;

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        if (cancelled) return;

        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });

        if (cancelled) return;

        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        if (cancelled) return;

        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();

        if (cancelled) return;

        setChannel(chatChannel);
      } catch (error) {
        if (!cancelled) {
          console.error(`Connection attempt ${attempt} failed:`, error);

          if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
            toast.error(`Connection failed. Retrying in ${delay / 1000}s... (${attempt}/${MAX_RETRIES})`);
            await new Promise((r) => {
              retryTimer = setTimeout(r, delay);
            });
            retryTimer = null;
            if (!cancelled) return initCall(attempt + 1);
          } else {
            setConnectionError("Failed to connect after multiple attempts. Please refresh the page.");
            toast.error("Failed to join video call after 3 attempts.");
          }
        }
      } finally {
        if (!cancelled) {
          setIsInitializingCall(false);
        }
      }
    };

    if (session && !loadingSession) initCall();

    // cleanup - performance reasons
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      // iife
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
    connectionError,
  };
}

export default useStreamClient;
