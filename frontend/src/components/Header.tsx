import { UserProfile } from "../types";

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h1 className="text-xl font-semibold">Email Scheduler</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <img
          src={user.picture}
          alt={user.name}
          className="h-10 w-10 rounded-full border border-slate-200"
        />
        <button
          onClick={onLogout}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
