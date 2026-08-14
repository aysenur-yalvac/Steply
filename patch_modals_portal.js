const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Move switchTarget modal to portal
const switchModalOld = `{/* Switch account confirmation modal */}
      {switchTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-slate-800">Hesap DeÄ\x9fiÅŸtir</h3>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{switchTarget.linked_name || switchTarget.linked_email}</span>{" "}
                hesabÄ±na geÃ§mek Ã¼zeresiniz. Mevcut oturumunuz kapatÄ±lacak.
              </p>
            </div>
            {switchError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {switchError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (!isSwitching) { setSwitchTarget(null); setSwitchError(null); } }}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Ä°ptal
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-70"
              >
                {isSwitching ? "GeÃ§iÅŸ yapÄ±lÄ±yor..." : "GeÃ§"}
              </button>
            </div>
          </div>
        </div>
      )}`;

// Instead of trying exact string match on encoded text, use regex
content = content.replace(
  /\{\/\* Switch account confirmation modal \*\/\}\s*\{switchTarget \&\& \([\s\S]*?}\s*\)\}/,
  `{/* Switch account confirmation modal — rendered via Portal to escape stacking context */}
      {switchTarget && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget && !isSwitching) { setSwitchTarget(null); setSwitchError(null); } }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-slate-800">Hesap Değiştir</h3>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{switchTarget.linked_name || switchTarget.linked_email}</span>{" "}
                hesabına geçmek üzeresiniz. Mevcut oturumunuz kapatılacak.
              </p>
            </div>
            {switchError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {switchError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (!isSwitching) { setSwitchTarget(null); setSwitchError(null); } }}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                disabled={isSwitching}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors disabled:opacity-70"
              >
                {isSwitching ? "Geçiş yapılıyor..." : "Geç"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}`
);

// Move removeTarget modal to portal
content = content.replace(
  /\{\/\* Remove account confirmation modal \*\/\}\s*\{removeTarget \&\& \([\s\S]*?}\s*\)\}/,
  `{/* Remove account confirmation modal — rendered via Portal */}
      {removeTarget && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget && !isRemoving) setRemoveTarget(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-extrabold text-slate-800">Hesap Bağlantısını Kaldır</h3>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{removeTarget.linked_name || removeTarget.linked_email}</span>{" "}
                hesabının bağlantısını kaldırmak istediğinize emin misiniz? Bu işlem her iki hesaptaki hızlı geçiş menüsünden de bu hesabı kaldıracaktır.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { if (!isRemoving) setRemoveTarget(null); }}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmRemoveAccount}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-70"
              >
                {isRemoving ? "Kaldırılıyor..." : "Kaldır"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}`
);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Done — both modals moved to React portals');
