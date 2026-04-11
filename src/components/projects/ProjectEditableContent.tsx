"use client";

import { useState, useTransition, useRef } from "react";
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
  Save,
  Lock,
  Globe,
} from "lucide-react";
import { updateProjectDetails, searchProfilesAction, toggleProjectPrivacyAction } from "@/app/dashboard/actions";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/avatar";

// ── Types ─────────────────────────────────────────────────────────────────────
type Member = { id: string; full_name: string; avatar_url?: string | null };

interface Props {
  project: {
    id: string;
    title: string;
    cleanedDescription: string;
    start_date?: string | null;
    end_date?: string | null;
    student_id?: string;
    github_link?: string | null;
    profiles?: { full_name: string; avatar_url?: string | null } | null;
    is_private?: boolean;
  };
  initialTeamMembers: Member[];
  currentUserId: string;
  isCompleted: boolean;
}

// ── MemberRow ─────────────────────────────────────────────────────────────────
function MemberRow({
  member,
  role,
  onRemove,
}: {
  member: Member;
  role: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
      <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 truncate">{member.full_name}</p>
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
  initialTeamMembers,
  currentUserId,
  isCompleted,
}: Props) {
  const isOwner = currentUserId === project.student_id;

  // Privacy state
  const [isPrivate,        setIsPrivate]        = useState(project.is_private ?? false);
  const [isPrivacyPending, setIsPrivacyPending] = useState(false);

  // Editable field state
  const [title,       setTitle]       = useState(project.title);
  const [description, setDescription] = useState(project.cleanedDescription);
  const [startDate,   setStartDate]   = useState(project.start_date ?? "");
  const [endDate,     setEndDate]     = useState(project.end_date ?? "");

  // Edit mode
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc,  setEditingDesc]  = useState(false);

  // Refs to programmatically open the native date pickers
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef   = useRef<HTMLInputElement>(null);

  // Team
  const [showMemberPanel,  setShowMemberPanel]  = useState(false);
  const [memberQuery,      setMemberQuery]      = useState("");
  const [searchResults,    setSearchResults]    = useState<Member[]>([]);
  const [isSearching,      setIsSearching]      = useState(false);
  const [selectedMember,   setSelectedMember]   = useState<Member | null>(null);
  const [addedMembers,     setAddedMembers]     = useState<Member[]>(initialTeamMembers);

  const [isPending, startTransition] = useTransition();

  // Dirty state — field changes OR member list changes
  const fieldsDirty =
    title       !== project.title ||
    description !== project.cleanedDescription ||
    startDate   !== (project.start_date ?? "") ||
    endDate     !== (project.end_date ?? "");

  const membersDirty =
    addedMembers.map((m) => m.id).join(",") !==
    initialTeamMembers.map((m) => m.id).join(",");

  const isDirty = fieldsDirty || membersDirty;

  // ── Save all ──────────────────────────────────────────────────────────────
  const saveAll = () => {
    const fd = new FormData();
    fd.set("project_id",  project.id);
    fd.set("title",       title);
    fd.set("description", description);
    fd.set("start_date",  startDate);
    fd.set("end_date",    endDate);
    fd.set(
      "team_members",
      JSON.stringify(addedMembers.map((m) => ({ id: m.id, full_name: m.full_name }))),
    );

    startTransition(async () => {
      try {
        const result = await updateProjectDetails(fd);
        if (result && "error" in result) {
          toast.error(result.error);
        } else {
          toast.success("Project details saved!");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  };

  // ── Privacy toggle ─────────────────────────────────────────────────────────
  const handlePrivacyToggle = async () => {
    const next = !isPrivate;
    setIsPrivate(next);
    setIsPrivacyPending(true);
    try {
      const result = await toggleProjectPrivacyAction(project.id, next);
      if (result && (result as any).columnMissing) {
        toast.error("Privacy feature requires a DB migration. Contact your admin.");
        setIsPrivate(!next); // revert
      } else {
        toast.success(next ? "Project is now private." : "Project is now public.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update privacy.");
      setIsPrivate(!next); // revert
    } finally {
      setIsPrivacyPending(false);
    }
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

  const selectMember = (m: Member) => {
    setSelectedMember(m);
    setMemberQuery(m.full_name);
    setSearchResults([]);
  };

  const confirmAddMember = () => {
    if (!selectedMember) return;
    setAddedMembers((prev) => [...prev, selectedMember]);
    setSelectedMember(null);
    setMemberQuery("");
    setSearchResults([]);
    toast.success(`${selectedMember.full_name} added to team!`);
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
                    if (e.key === "Enter")  setEditingTitle(false);
                    if (e.key === "Escape") { setTitle(project.title); setEditingTitle(false); }
                  }}
                />
                <button
                  onClick={() => setEditingTitle(false)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Apply"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setTitle(project.title); setEditingTitle(false); }}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Cancel"
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
                  onClick={() => setEditingDesc(false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Apply
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
            {isOwner ? (
              <button
                type="button"
                onClick={() => startDateRef.current?.showPicker()}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group/cal"
                title="Pick start date"
              >
                <Calendar className="w-4 h-4 group-hover/cal:scale-110 transition-transform" />
                Start
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" /> Start
              </span>
            )}
            {isOwner ? (
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-slate-700 font-medium bg-white border border-indigo-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer hover:border-indigo-400"
              />
            ) : (
              <span className="text-sm text-slate-600 font-medium">
                {startDate ? new Date(startDate).toLocaleDateString("en-US") : "—"}
              </span>
            )}
          </div>

          {/* End date — disabled until a start date is selected */}
          <div className="flex items-center gap-2">
            {isOwner ? (
              <button
                type="button"
                onClick={() => startDate && endDateRef.current?.showPicker()}
                disabled={!startDate}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors group/cal ${
                  startDate
                    ? "text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    : "text-slate-300 cursor-not-allowed"
                }`}
                title={startDate ? "Pick end date" : "Select a start date first"}
              >
                <Calendar className={`w-4 h-4 transition-transform ${startDate ? "group-hover/cal:scale-110" : ""}`} />
                End
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" /> End
              </span>
            )}
            {isOwner ? (
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                min={startDate || undefined}
                disabled={!startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`text-sm font-medium bg-white border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  startDate
                    ? "text-slate-700 border-indigo-200 cursor-pointer hover:border-indigo-400"
                    : "text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50"
                }`}
              />
            ) : (
              <span className="text-sm text-slate-600 font-medium">
                {endDate ? new Date(endDate).toLocaleDateString("en-US") : "—"}
              </span>
            )}
          </div>
        </div>

        {/* ── Privacy Toggle (owner only) ──────────────────────────────────── */}
        {isOwner && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPrivate ? (
                  <Lock className="w-4 h-4 text-[#7C3AFF]" />
                ) : (
                  <Globe className="w-4 h-4 text-emerald-500" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {isPrivate ? "Private Project" : "Public Project"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isPrivate
                      ? "Only teachers and you can view this project."
                      : "Everyone with the link can view this project."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrivacyToggle}
                disabled={isPrivacyPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                  isPrivate ? "bg-[#7C3AFF]" : "bg-slate-200"
                }`}
                title={isPrivate ? "Make public" : "Make private"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isPrivate ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* ── Save Project Details button (owner only) ─────────────────────── */}
        {isOwner && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={saveAll}
              disabled={isPending || !isDirty}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[.98] ${
                isDirty
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_24px_-6px_rgba(79,70,229,0.45)]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isDirty ? "Save Changes" : "No unsaved changes"}
                </>
              )}
            </button>
          </div>
        )}
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
          {/* Owner row */}
          <MemberRow
            member={{
              id: project.student_id ?? "",
              full_name: project.profiles?.full_name || "Project Owner",
              avatar_url: project.profiles?.avatar_url,
            }}
            role="Owner"
          />
          {addedMembers.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              role="Member"
              onRemove={
                isOwner
                  ? () => setAddedMembers((prev) => prev.filter((x) => x.id !== m.id))
                  : undefined
              }
            />
          ))}
        </div>

        {/* Search panel */}
        {showMemberPanel && isOwner && (
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Input row + Ekle button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={memberQuery}
                  onChange={(e) => {
                    if (selectedMember) setSelectedMember(null);
                    handleMemberSearch(e.target.value);
                  }}
                  placeholder="Search students by name..."
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                )}
              </div>
              <button
                type="button"
                onClick={confirmAddMember}
                disabled={!selectedMember}
                title={selectedMember ? `Add ${selectedMember.full_name}` : "Select a student first"}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 ${
                  selectedMember
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Check className="w-4 h-4" />
                Ekle
              </button>
            </div>

            {/* Search results — click to select, then confirm with Ekle */}
            {searchResults.length > 0 && (
              <div className="mt-2 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectMember(r)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 text-left transition-colors group"
                  >
                    <Avatar src={r.avatar_url} name={r.full_name} size="sm" />
                    <span className="text-sm text-slate-700 font-medium flex-1 group-hover:text-indigo-700">
                      {r.full_name}
                    </span>
                    <UserPlus className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {/* Selected preview */}
            {selectedMember && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Avatar src={selectedMember.avatar_url} name={selectedMember.full_name} size="sm" />
                <span className="text-sm font-semibold text-indigo-700 flex-1">{selectedMember.full_name}</span>
                <span className="text-xs text-indigo-400">Ekle butonuna bas</span>
              </div>
            )}

            {memberQuery.length >= 2 && !isSearching && searchResults.length === 0 && !selectedMember && (
              <p className="text-xs text-slate-400 text-center mt-3">No students found.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
