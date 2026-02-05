interface TabsProps {
  activeTab: "scheduled" | "sent";
  onChange: (tab: "scheduled" | "sent") => void;
}

const Tabs = ({ activeTab, onChange }: TabsProps) => {
  return (
    <div className="flex gap-3">
      {(["scheduled", "sent"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
            activeTab === tab
              ? "bg-primary text-white shadow"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          {tab} Emails
        </button>
      ))}
    </div>
  );
};

export default Tabs;
