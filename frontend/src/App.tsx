import { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import EmailTable from "./components/EmailTable";
import ComposeModal from "./components/ComposeModal";
import { fetchEmails, scheduleEmails } from "./api/emails";
import { EmailRecord, SchedulePayload } from "./api/types";
import { UserProfile } from "./types";

interface GoogleTokenPayload {
  name: string;
  email: string;
  picture: string;
}

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const logout = () => {
    setUser(null);
  };

  const loadEmails = async (status?: string) => {
    setLoading(true);
    try {
      const data = await fetchEmails(status);
      setEmails(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEmails(activeTab);
    }
  }, [user, activeTab]);

  const schedule = async (payload: SchedulePayload) => {
    await scheduleEmails(payload);
    await loadEmails(activeTab);
  };

  const senderEmail = useMemo(() => user?.email ?? "", [user]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-semibold">ReachInbox Scheduler</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in with Google to access your email scheduling dashboard.
          </p>
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const payload = jwtDecode<GoogleTokenPayload>(credentialResponse.credential ?? "");
                setUser({
                  name: payload.name,
                  email: payload.email,
                  picture: payload.picture
                });
              }}
              onError={() => {
                console.error("Login Failed");
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Header user={user} onLogout={logout} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
          <button
            onClick={() => setShowCompose(true)}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
          >
            Compose New Email
          </button>
        </div>
        <EmailTable emails={emails} loading={loading} variant={activeTab} />
      </div>
      {showCompose ? (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSchedule={schedule}
          defaultSender={senderEmail}
        />
      ) : null}
    </div>
  );
};

export default App;
