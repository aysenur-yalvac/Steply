const fs = require("fs");
let detail = fs.readFileSync("src/components/assignments/AssignmentDetailClient.tsx", "utf8");

detail = detail.replace(
  'import { FileText, Clock, UploadCloud, CheckCircle2, AlertCircle, Calendar } from "lucide-react";',
  'import { FileText, Clock, UploadCloud, CheckCircle2, AlertCircle, Calendar, Trash2 } from "lucide-react";\nimport { deleteSubmissionAction } from "@/lib/actions";'
);

// find where my submission is mapped/rendered for student
const oldSubmission = `<div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-400">Dosyaniz basariyla yuklendi</p>
                    <a href={mySubmission.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-emerald-300 underline mt-1 block">
                      Dosyayi Goruntule
                    </a>
                  </div>
                </div>`;

const newSubmission = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl mt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Dosyaniz basariyla yuklendi</p>
                      <a href={mySubmission.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 underline mt-1 block">
                        Dosyayi Goruntule
                      </a>
                    </div>
                  </div>
                  {!isExpired && (
                    <button 
                      onClick={async () => {
                        if(confirm("Yuklediginiz dosyayi silmek istediginize emin misiniz?")) {
                          const res = await deleteSubmissionAction(mySubmission.id, mySubmission.file_url);
                          if(res.success) {
                            window.location.reload();
                          } else {
                            alert("Silme basarisiz: " + res.error);
                          }
                        }
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
                    </button>
                  )}
                </div>`;

detail = detail.replace(oldSubmission, newSubmission);

// add light mode fixes to assignment detail headers if any
detail = detail.replace(/bg-slate-900/g, 'bg-white dark:bg-slate-900');
detail = detail.replace(/bg-slate-950/g, 'bg-slate-50 dark:bg-slate-950');
detail = detail.replace(/text-slate-200/g, 'text-slate-800 dark:text-slate-200');
detail = detail.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
detail = detail.replace(/text-slate-400/g, 'text-slate-600 dark:text-slate-400');
detail = detail.replace(/border-slate-800/g, 'border-slate-200 dark:border-slate-800');
detail = detail.replace(/text-white/g, 'text-slate-900 dark:text-white');

fs.writeFileSync("src/components/assignments/AssignmentDetailClient.tsx", detail, "utf8");
console.log("Updated AssignmentDetailClient.tsx");
