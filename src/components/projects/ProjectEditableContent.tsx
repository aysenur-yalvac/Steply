"use client";

import { useState, useTransition } from "react";
import {
  Pencil,
  Check,
  X,
  Calendar,
  UserPlus,
  Search,
  Loader2,
  Users,
  Github,
  CheckCircle,
  Clock,
} from "lucide-react";
import { updateProjectDetails, searchProfilesAction } from "@/app/dashboard/actions";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  project: {
    id: string;
    title: string;
    cleanedDescription: string;
    start_date?: string | null;
    end_date?: string | null;
    student_id?: string;
    github_link?: string | null;
    profiles?: { full_name: string } | null;
  };
  currentUserId: string;
  isCompleted: boolean;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── MemberRow ─────────────────────────────────────────────────────────────────
function MemberRow({
  name,
  role,
  onRemove,
}: {
  name: string;
  role: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{name}</p>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          title="Remove"
          className="p-1 text-slate-300 hover:text-red-400 transition-colors rounded-lg"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProjectEditableContent({
  project,
  currentUserId,
  isCompleted,
}: Props) {
  const isOwner = currentUserId === project.student_id;

  // Editable field state
  const [title,       setTitle]       = useState(project.title);
  const [description, setDescription] = useState(project.cleanedDescription);
  const [startDate,   setStartDate]   = useState(project.start_date ?? "");
  const [endDate,     setEndDate]     = useState(project.end_date ?? "");

  // Edit mode
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc,  setEditingDesc]  = useState(false);

  // Team
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [memberQuery,     setMemberQuery]     = useState("");
  const [searchResults,   setSearchResults]   = useState<{ id: string; full_name: string }[]>([]);
  const [isSearching,     setIsSearching]     = useState(false);
  const [addedMembers,    setAddedMembers]    = useState<{ id: string; full_name: string }[]>([]);

  const [isPending, startTransition] = useTransition();

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveDetails = (overrides: {
    t?: string;
    d?: string;
    sd?: string;
    ed?: string;
  } = {}) => {
    const fd = new FormData();
    fd.set("project_id",  project.id);
    fd.set("title",       overrides.t  ?? title);
    fd.set("description", overrides.d  ?? description);
    fd.set("start_date",  overrides.sd ?? startDate);
    fd.set("end_date",    overrides.ed ?? endDate);

    startTransition(async () => {
      try {
        await updateProjectDetails(fd);
        toast.success("Changes saved!");
      } catch (err: any) {
        toast.error(err.message || "Failed to save");
      }
    });
  };

  // ── Member search ──────────────────────────────────────────────────────────
  const handleMemberSearch = async (q: string) => {
    setMemberQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const results = await searchProfilesAction(q);
      setSearchResults(
        results.filter(
          (r) => r.id !== project.student_id && !addedMembers.some((m) => m.id === r.id),
        ),
      );
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = (m: { id: string; full_name: string }) => {
    setAddedMembers((prev) => [...prev, m]);
    setSearchResults([]);
    setMemberQuery("");
    toast.success(`${m.full_name} added to team!`);
  };

  return (
    <>
      {/* ── About Project card ───────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">

        {/* Header: label + status badge */}
        <div className="flex justify-between items-center mb-5 gap-4">
          <h3 className="text-xl font-bold text-slate-800">About Project</h3>
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium border border-emerald-500/20 shrink-0">
              <CheckCircle className="w-4 h-4" /> Completed
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium border border-amber-500/20 shrink-0">
              <Clock className="w-4 h-4" /> In Progress
            </div>
          )}
        </div>

        {/* Editable project title (owner only) */}
        {isOwner && (
          <div className="mb-5">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  className="flex-1 text-base font-semibold text-slate-800 bg-slate-50 border border-indigo-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter")  { saveDetails({ t: title }); setEditingTitle(false); }
                    if (e.key === "Escape") { setTitle(project.title);   setEditingTitle(false); }
                  }}
                />
                <button
                  onClick={() => { saveDetails({ t: title }); setEditingTitle(false); }}
                  disabled={isPending}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setTitle(project.title); setEditingTitle(false); }}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <span className="text-base font-semibold text-slate-600 truncate">{title}</span>
                <button
                  onClick={() => setEditingTitle(true)}
                  title="Edit title"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-500 rounded-lg transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Editable description */}
        <div className="mb-8">
          {isOwner && editingDesc ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border border-indigo-300 rounded-xl text-slate-600 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setDescription(project.cleanedDescription); setEditingDesc(false); }}
                  className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { saveDetails({ d: description }); setEditingDesc(false); }}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`relative group ${isOwner ? "cursor-pointer" : ""}`}
              onClick={() => isOwner && setEditingDesc(true)}
            >
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap pr-14">
                {description || "No description has been entered for this project yet."}
              </p>
              {isOwner && (
                <span className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  <Pencil className="w-3 h-3" /> Edit
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dates + GitHub row */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          {project.github_link && (
            <a
              href={project.github_link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-dusty-rose hover:text-rose-600 transition-colors font-bold"
            >
              <Github className="w-5 h-5" /> GitHub Repository
            </a>
          )}

          {/* Start date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Start</span>
            {isOwner ? (
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={(e) => saveDetails({ sd: e.target.value })}
                className="text-sm text-slate-700 font-medium bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
              />
            ) : (
              <span className="text-sm text-slate-600 font-medium">
                {startDate ? new Date(startDate).toLocaleDateString("en-US") : "—"}
              </span>
            )}
          </div>

          {/* End date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">End</span>
            {isOwner ? (
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={(e) => saveDetails({ ed: e.target.value })}
                className="text-sm text-slate-700 font-medium bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer"
              />
            ) : (
              <span className="text-sm text-slate-600 font-medium">
                {endDate ? new Date(endDate).toLocaleDateString("en-US") : "—"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Team Members card ────────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" /> Team Members
          </h3>
          {isOwner && (
            <button
              onClick={() => setShowMemberPanel((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Member
            </button>
          )}
        </div>

        {/* Member list */}
        <div className="flex flex-col gap-1">
          <MemberRow
            name={project.profiles?.full_name || "Project Owner"}
            role="Owner"
          />
          {addedMembers.map((m) => (
            <MemberRow
              key={m.id}
              name={m.full_name}
              role="Member"
              onRemove={isOwner ? () => setAddedMembers((prev) => prev.filter((x) => x.id !== m.id)) : undefined}
            />
          ))}
        </div>

        {/* Search panel */}
        {showMemberPanel && isOwner && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={memberQuery}
                onChange={(e) => handleMemberSearch(e.target.value)}
                placeholder="Search members by name..."
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => addMember(r)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {initials(r.full_name)}
                    </div>
                    <span className="text-sm text-slate-700 font-medium flex-1 group-hover:text-indigo-700">
                      {r.full_name}
                    </span>
                    <UserPlus className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {memberQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
              <p className="text-xs text-slate-400 text-center mt-3">No members found.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
