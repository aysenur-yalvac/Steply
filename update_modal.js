const fs = require('fs');
let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

const oldModalStart = `      {/* Settings Modal */}`;
const oldModalEnd = `      )}
    </div>
  );
}`;

const newModal = `      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-800">GitHub Ayarlari</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {!repo ? (
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-slate-500 mb-4 text-center">Projenize GitHub deposunu baglayarak commit'lerin otomatik senkronize olmasini saglayin.</p>
                  <form onSubmit={handleConnect} className="flex flex-col gap-3">
                    <input
                      type="url"
                      placeholder="https://github.com/kullanici/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-slate-900 placeholder:text-slate-400 bg-white border-slate-300 dark:text-slate-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <button type="submit" disabled={loading} className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50">
                      {loading ? 'Baglaniyor...' : 'Bagla'}
                    </button>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Data & Actions */}
                  <div className="flex flex-col h-full">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                      <Github className="w-5 h-5" /> {repo.repo_owner}/{repo.repo_name}
                    </h4>

                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Payload URL</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="text" readOnly value={payloadUrl} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-mono" />
                          <button onClick={() => copyToClipboard(payloadUrl, setCopiedUrl)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Secret Key</label>
                        <div className="flex gap-2 items-center mt-1">
                          <input type="text" readOnly value={repo.webhook_secret} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-mono" />
                          <button onClick={() => copyToClipboard(repo.webhook_secret, setCopiedSecret)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            {copiedSecret ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <button onClick={handleRemove} disabled={loading} className="w-full py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Baglantiyi Kes
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Setup Guide */}
                  <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-slate-100 h-full flex flex-col">
                    <h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Webhook Kurulum Rehberi
                    </h5>
                    <ol className="list-decimal list-inside text-sm text-slate-600 space-y-3 mb-6 flex-1">
                      <li>GitHub deponuzda <strong>Settings &gt; Webhooks &gt; Add webhook</strong> kismina gidin.</li>
                      <li>Soldaki <strong>Payload URL</strong> ve <strong>Secret</strong> degerlerini kopyalayip ilgili alanlara yapistirin.</li>
                      <li>Content type secimini dogru yapin (Asagidaki uyariya dikkat edin).</li>
                      <li>Sadece <strong>Push events</strong> secmeli veya tumunu isaretleyebilirsiniz.</li>
                    </ol>

                    <div className="mt-auto bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                      <p className="text-sm text-amber-800 font-medium flex gap-2">
                        <span>⚠️</span>
                        <span>
                          <strong className="block mb-1">ÖNEMLİ</strong>
                          GitHub'da <strong>'Content type'</strong> alanini mutlaka <strong>'application/json'</strong> yapin! Aksi halde webhook basarisiz olacaktir.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

const startIdx = content.indexOf(oldModalStart);
if (startIdx !== -1) {
  content = content.substring(0, startIdx) + newModal;
  fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');
  console.log("Updated GitHub modal");
} else {
  console.log("Could not find start of old modal");
}
