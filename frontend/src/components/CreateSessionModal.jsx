import { LoaderIcon, PlusIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

function CreateSessionModal({
  isOpen,
  onClose,
  onCreateRoom,
  isCreating,
  createdSession,
}) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = () => {
    setCopiedField(null);
    onClose();
  };

  // After session is created, show meeting credentials
  if (createdSession) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-2xl mb-2">Meeting Created!</h3>
          <p className="text-base-content/70 mb-6">
            Share these credentials with participants to join the meeting.
          </p>

          <div className="space-y-4">
            {/* Meeting ID */}
            <div className="bg-base-200 rounded-xl p-4">
              <label className="text-sm font-semibold text-base-content/60 mb-1 block">
                Meeting ID
              </label>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xl font-bold tracking-wider">
                  {createdSession.meetingId}
                </span>
                <button
                  className="btn btn-sm btn-ghost gap-1"
                  onClick={() => handleCopy(createdSession.meetingId, "meetingId")}
                >
                  {copiedField === "meetingId" ? (
                    <><CheckIcon className="size-4 text-success" /> Copied</>
                  ) : (
                    <><CopyIcon className="size-4" /> Copy</>
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="bg-base-200 rounded-xl p-4">
              <label className="text-sm font-semibold text-base-content/60 mb-1 block">
                Password
              </label>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xl font-bold tracking-wider">
                  {createdSession.password}
                </span>
                <button
                  className="btn btn-sm btn-ghost gap-1"
                  onClick={() => handleCopy(createdSession.password, "password")}
                >
                  {copiedField === "password" ? (
                    <><CheckIcon className="size-4 text-success" /> Copied</>
                  ) : (
                    <><CopyIcon className="size-4" /> Copy</>
                  )}
                </button>
              </div>
            </div>

            {/* Copy All */}
            <button
              className="btn btn-outline btn-block gap-2"
              onClick={() =>
                handleCopy(
                  `Meeting ID: ${createdSession.meetingId}\nPassword: ${createdSession.password}`,
                  "all"
                )
              }
            >
              {copiedField === "all" ? (
                <><CheckIcon className="size-4 text-success" /> Copied All</>
              ) : (
                <><CopyIcon className="size-4" /> Copy All to Clipboard</>
              )}
            </button>
          </div>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleClose}>
              Done
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={handleClose}></div>
      </div>
    );
  }

  // Default: show create button
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-2xl mb-2">Create Instant Meeting</h3>
        <p className="text-base-content/70 mb-6">
          Start a new meeting room instantly. A unique Meeting ID and Password will be generated for you to share.
        </p>

        <div className="alert mb-4">
          <div>
            <p className="text-sm">
              Max Participants: <span className="font-medium">3 (host + 2)</span>
            </p>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}
            {isCreating ? "Creating..." : "Create Instant Meeting"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
}

export default CreateSessionModal;
