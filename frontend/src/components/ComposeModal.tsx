import { useState } from "react";
import { SchedulePayload } from "../api/types";

interface ComposeModalProps {
  onClose: () => void;
  onSchedule: (payload: SchedulePayload) => Promise<void>;
  defaultSender: string;
}

const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

const ComposeModal = ({ onClose, onSchedule, defaultSender }: ComposeModalProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [delayBetweenMs, setDelayBetweenMs] = useState(2000);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const matches = text.match(emailRegex) ?? [];
      setRecipients(matches);
    };
    reader.readAsText(file);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSchedule({
        sender: defaultSender,
        subject,
        body,
        recipients,
        scheduledAt: new Date(scheduledAt).toISOString(),
        delayBetweenMs
      });
      onClose();
    } catch (err) {
      setError("Failed to schedule emails. Check required fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compose New Email</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-600">
            Subject
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-600">
            Body
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              className="rounded-xl border border-slate-200 px-4 py-2"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-600">
              Start time
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-600">
              Delay between emails (ms)
              <input
                type="number"
                value={delayBetweenMs}
                onChange={(event) => setDelayBetweenMs(Number(event.target.value))}
                className="rounded-xl border border-slate-200 px-4 py-2"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-600">
            Upload CSV/Text file of leads
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  handleFile(file);
                }
              }}
            />
            <span className="text-xs text-slate-500">Detected {recipients.length} emails</span>
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
          >
            {submitting ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;
