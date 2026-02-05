import { EmailRecord } from "../api/types";

interface EmailTableProps {
  emails: EmailRecord[];
  loading: boolean;
  variant: "scheduled" | "sent";
}

const EmailTable = ({ emails, loading, variant }: EmailTableProps) => {
  if (loading) {
    return <div className="rounded-2xl bg-white p-6 shadow-sm">Loading emails...</div>;
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm">
        No {variant} emails yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Subject</th>
            <th className="px-6 py-3">{variant === "scheduled" ? "Scheduled time" : "Sent time"}</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {emails.map((email) => (
            <tr key={email.id}>
              <td className="px-6 py-4 text-slate-700">{email.recipient}</td>
              <td className="px-6 py-4 text-slate-700">{email.subject}</td>
              <td className="px-6 py-4 text-slate-700">
                {variant === "scheduled" ? email.scheduledAt : email.sentAt ?? "-"}
              </td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {email.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailTable;
