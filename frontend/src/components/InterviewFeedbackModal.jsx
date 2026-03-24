import { useState, useEffect } from "react";
import { Loader2Icon, SendIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InterviewFeedbackModal({
  isOpen,
  onClose,
  sessionId,
  code,
  call,
  endSessionMutation,
  navigate,
}) {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [result, setResult] = useState("Pass");
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ─── Robust auto-fill: extract candidate email from Stream call members ───
  useEffect(() => {
    if (!isOpen || !call) return;

    try {
      const members = call.state?.members;
      if (!members || typeof members !== "object") return;

      // Handle both Map and plain object
      const memberEntries =
        members instanceof Map
          ? Array.from(members.values())
          : Object.values(members);

      // The local (host) user ID
      const localUserId = call.state?.localParticipant?.userId;

      // Find the first member who is NOT the host
      const otherMember = memberEntries.find(
        (m) => m.user?.id !== localUserId && m.user?.id !== undefined
      );

      if (!otherMember?.user) return;

      const user = otherMember.user;

      // Priority chain: custom.email → name → id
      const candidates = [
        user.custom?.email,
        user.name,
        user.id,
      ].filter(Boolean);

      // Pick the first value that looks like a valid email
      const validEmail = candidates.find((val) => EMAIL_REGEX.test(val));

      if (validEmail) {
        setCandidateEmail(validEmail);
      } else if (candidates.length > 0) {
        // Fallback: set the best available value even if not a valid email —
        // the host can manually correct it in the editable input
        setCandidateEmail(candidates[0]);
      }
    } catch (err) {
      console.warn("Could not auto-fill candidate email:", err);
    }
  }, [isOpen, call]);

  // ─── Submit handler ───
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!candidateEmail || !EMAIL_REGEX.test(candidateEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!feedback.trim()) {
      toast.error("Please write your feedback before submitting.");
      return;
    }

    setIsSending(true);
    try {
      // 1. Send the interview report email
      await axiosInstance.post("/sessions/report", {
        candidateEmail,
        result,
        feedback: feedback.trim(),
        finalCode: code || "",
      });

      toast.success("Interview report sent successfully!");

      // 2. End the Stream video call (gracefully)
      try {
        await call?.endCall();
      } catch (err) {
        console.warn("call.endCall() failed (may already be ended):", err);
      }

      // 3. End the session in the database and navigate
      endSessionMutation.mutate(sessionId, {
        onSuccess: () => navigate("/dashboard"),
        onError: () => {
          // Even if DB update fails, navigate away — the email was already sent
          toast.error("Session ended but DB update failed.");
          navigate("/dashboard");
        },
      });
    } catch (error) {
      console.error("Failed to send report:", error);
      toast.error(
        error.response?.data?.message || "Failed to send report. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-base-200 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-base-300"
        style={{ animation: "fadeInScale 0.25s ease-out" }}
      >
        {/* Inline keyframes */}
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-base-300">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📝 Interview Feedback
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isSending}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Candidate Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Candidate Email</span>
            </label>
            <input
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="candidate@example.com"
              className="input input-bordered w-full"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              required
              disabled={isSending}
              spellCheck="false"
              autoCorrect="off"
            />
          </div>

          {/* Result */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Result</span>
            </label>
            <div className="flex gap-4">
              <label
                className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl border-2 transition-all ${result === "Pass"
                  ? "border-success bg-success/10 text-success font-bold"
                  : "border-base-300 hover:border-success/40"
                  }`}
              >
                <input
                  type="radio"
                  name="result"
                  className="radio radio-success radio-sm"
                  value="Pass"
                  checked={result === "Pass"}
                  onChange={(e) => setResult(e.target.value)}
                  disabled={isSending}
                />
                ✅ Pass
              </label>
              <label
                className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl border-2 transition-all ${result === "Fail"
                  ? "border-error bg-error/10 text-error font-bold"
                  : "border-base-300 hover:border-error/40"
                  }`}
              >
                <input
                  type="radio"
                  name="result"
                  className="radio radio-error radio-sm"
                  value="Fail"
                  checked={result === "Fail"}
                  onChange={(e) => setResult(e.target.value)}
                  disabled={isSending}
                />
                ❌ Fail
              </label>
            </div>
          </div>

          {/* Feedback */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Feedback</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-28 resize-none"
              placeholder="Write your feedback for the candidate..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              disabled={isSending}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon className="w-4 h-4" />
                  Send Report & End Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InterviewFeedbackModal;
