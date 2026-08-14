const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const regex = /{switchTarget && \([\s\S]*?(<div className="fixed inset-0 z-\[9999\][\s\S]*?)<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}/m;
const match = content.match(regex);
if (match) {
  let modalContent = match[1];
  
  // Replace the modal to include createPortal and document.body
  const newModal = `{switchTarget && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if(e.target === e.currentTarget && !isSwitching) { setSwitchTarget(null); setSwitchError(null); }}}>
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
      )}
    </div>
  );
}`;
  content = content.replace(match[0], newModal);
  fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
  console.log("Patched successfully!");
} else {
  console.log("Regex didn't match.");
}
