const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const startIdx = content.indexOf('{/* User footer */}');
const endIdx = content.indexOf('      {/* Remove account confirmation modal */}');

let footerBlock = content.substring(startIdx, endIdx);

const newFooterBlock = `{/* User footer */}
      <div className={\`relative border-t border-slate-100 \${collapsed ? 'p-2' : 'p-3'}\`}>

        {/* Account switcher dropdown - HIDDEN ON COLLAPSED */}
        {!collapsed && isAccountMenuOpen && (
          <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[100]">
            {/* Current account */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-violet-50 border-b border-violet-100">
              <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} size={28} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-violet-800 truncate">{userName || userEmail}</p>
                <p className="text-[10px] text-violet-500 capitalize">{role || "student"}</p>
              </div>
              <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
            </div>

            {/* Linked accounts */}
            {isLoadingAccounts && accounts.length === 0 && (
              <div className="px-3 py-2 text-[11px] text-slate-400 text-center">Yükleniyor...</div>
            )}
            {!isLoadingAccounts && accounts.length === 0 && (
              <div className="px-3 py-2 text-[11px] text-slate-400 text-center">Bağlı hesap yok</div>
            )}
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 group">
                <button
                  type="button"
                  onClick={() => { setSwitchTarget(acc); setIsAccountMenuOpen(false); }}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                >
                  <AccountAvatar src={acc.linked_avatar} name={acc.linked_name || acc.linked_email} size={28} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{acc.linked_name || acc.linked_email}</p>
                    <p className="text-[10px] text-slate-400 truncate">{acc.linked_email}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setRemoveTarget(acc); setIsAccountMenuOpen(false); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all"
                  title="Bağlantıyı kaldır"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add account */}
            <button
              type="button"
              disabled={!userId}
              onClick={() => {
                if (!userId) return;
                document.cookie = \`_steply_link_owner=\${userId}; path=/; max-age=600; SameSite=Lax\`;
                window.location.replace(\`/auth/login?link_account=true&owner_id=\${userId}\`);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-violet-600 transition-colors border-t border-slate-100 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Hesap Ekle
            </button>
          </div>
        )}

        {collapsed ? (
          /* Collapsed footer: Vertical account switcher + signout */
          <div className="flex flex-col items-center gap-2 w-full px-0 py-2 overflow-hidden">
            {/* Active Account with emerald ring */}
            <Link
              href="/dashboard/profile"
              onClick={onClose}
              title={userName || userEmail || "Aktif Profil"}
              className="flex justify-center items-center w-9 h-9 rounded-full ring-2 ring-emerald-500 hover:ring-emerald-400 transition-all p-[2px] shrink-0"
            >
              <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} size={32} />
            </Link>

            {/* Other Accounts */}
            {accounts.map(acc => (
              <button
                key={acc.id}
                type="button"
                onClick={() => { handleDirectSwitch(acc); setIsAccountMenuOpen(false); }}
                title={acc.linked_name || acc.linked_email}
                className="flex justify-center items-center w-9 h-9 rounded-full opacity-70 hover:opacity-100 hover:ring-2 hover:ring-violet-400 transition-all p-[2px] shrink-0"
              >
                <AccountAvatar src={acc.linked_avatar} name={acc.linked_name || acc.linked_email} size={28} />
              </button>
            ))}

            {/* Add account icon-only */}
            <button
              type="button"
              disabled={!userId}
              onClick={() => {
                if (!userId) return;
                document.cookie = \`_steply_link_owner=\${userId}; path=/; max-age=600; SameSite=Lax\`;
                window.location.replace(\`/auth/login?link_account=true&owner_id=\${userId}\`);
              }}
              title="Yeni Hesap Ekle"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 hover:bg-violet-50 transition-colors shrink-0 disabled:opacity-40"
            >
              <Plus className="w-5 h-5 text-gray-400 hover:text-purple-600" />
            </button>

            <div className="w-6 h-px bg-slate-200 my-1 shrink-0" />
            
            <button
              onClick={() => signOut()}
              title="Çıkış Yap"
              className="flex items-center justify-center p-2 w-9 h-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <>
            {/* Profile button + switcher toggle */}
            <div className="flex items-center gap-1 mb-1">
              <Link
                href="/dashboard/profile"
                onClick={onClose}
                className="flex items-center gap-3 flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <AccountAvatar src={avatarUrl} name={userName || userEmail || "?"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{userName || userEmail}</p>
                  <p className="text-[10px] text-slate-500 capitalize font-medium">{role || "student"}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(o => !o)}
                className="shrink-0 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Hesap değiştir"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              Sign Out
            </button>
          </>
        )}
      </div>

`;

content = content.replace(footerBlock, newFooterBlock);
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Successfully rewrote footer!');
