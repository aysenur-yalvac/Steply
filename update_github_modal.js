const fs = require('fs');

let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

const newBox = `
              <div className="mt-4 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-2 text-sm">
                  <span>👥 Ekip Arkadaşları Nasıl Dahil Edilir?</span>
                </h4>
                <p className="text-slate-600 dark:text-zinc-300 mb-2 leading-relaxed text-xs">
                  Projeye ortak olan diğer üyelerin de attığı commit'lerin Steply akışına düşmesi için:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-zinc-300 text-xs">
                  <li>
                    GitHub deponuzdan <strong>Settings &gt; Collaborators</strong> sekmesine gidip arkadaşlarınızı ekleyin.
                  </li>
                  <li>
                    Ekip üyelerinizin <strong>Steply e-postaları</strong> ile bilgisayarlarındaki <strong>Git e-postasının</strong> (<code>git config user.email</code>) aynı olduğundan emin olun.
                  </li>
                </ul>
                <p className="mt-2 text-indigo-700 dark:text-indigo-300 font-medium text-xs">
                  ✨ Ekip arkadaşlarınızın ekstra bir Webhook kurmasına gerek yoktur. Attıkları push'lar doğrudan kendi adlarıyla akışa düşecektir.
                </p>
              </div>`;

// Insert it right before the closing div of the right column
content = content.replace(
  `              </div>
            </div>
          </div>
        )}`,
  `              </div>${newBox}
            </div>
          </div>
        )}`
);

fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');
console.log("Updated GitHubIntegrationCard.tsx");
