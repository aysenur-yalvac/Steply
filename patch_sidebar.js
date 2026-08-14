const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const modalStart = `{switchTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">`;

if (content.includes(modalStart)) {
  content = content.replace(modalStart, `{switchTarget && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if(e.target === e.currentTarget && !isSwitching) { setSwitchTarget(null); setSwitchError(null); }}}>`);
  
  const modalEnd = `</div>
        </div>
      )}
    </div>
  );
}`;
  if (content.includes(modalEnd)) {
    content = content.replace(modalEnd, `</div>
        </div>,
        document.body
      )}
    </div>
  );
}`);
    fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
    console.log("Patched switchTarget modal to use createPortal.");
  } else {
    console.log("Could not find modal end.");
  }
} else {
  console.log("Could not find modal start.");
}
