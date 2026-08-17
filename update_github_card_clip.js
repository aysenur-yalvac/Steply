const fs = require('fs');

let cardContent = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

// 1. Height Adjustment
cardContent = cardContent.replace(
  'max-h-[360px] h-[360px]',
  'max-h-[420px] h-[420px]'
);

// 2 & 3. Container and Clipping Fix
// Current container:
// <div className="relative border-l-2 border-indigo-100 ml-3 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
// If we want no clipping, the scrollable area should be a parent div, and the timeline should be inside it, OR we just use padding on the scroll container.
// If we put border-l-2 on an inner div, or just give padding.
// Let's replace the scroll container and its inner structure.
const oldScrollArea = `<div className="relative border-l-2 border-indigo-100 ml-3 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">`;
const newScrollArea = `<div className="flex-1 overflow-y-auto pl-2 pr-2 pt-4 pb-4 custom-scrollbar">\n          <div className="relative border-l-2 border-indigo-100 ml-2 space-y-4">`;

// We also need to close this extra div after the commits.map
// Let's replace the closing tags.
//         )
//       )}
//
//       {mounted 
// Find the `</div>\n        )\n      )}` 
const oldClosing = `          </div>
        )
      )}`;
const newClosing = `          </div>
          </div>
        )
      )}`;

cardContent = cardContent.replace(oldScrollArea, newScrollArea);
cardContent = cardContent.replace(oldClosing, newClosing);

// Now fix the commit card.
// Old:
// <div key={commit.id} className="relative pl-8">
//   <span className="absolute -left-[11px] top-3 w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center overflow-hidden z-10">

// With the new wrapper, the `border-l-2 ml-2` is the timeline line. The child is `relative pl-8`. The circle can be `absolute -left-[11px] top-3`. Since the scrollable parent `overflow-y-auto` now has `pl-2` and the inner div has `ml-2`, the `-left-[11px]` will bleed into the `ml-2` + `pl-2` area, which is 4px + 8px = 12px. So it won't be clipped!
// Wait, the user suggested: "İkonu çizgi üzerine yerleştirirken sol sınırı taşırmayacak güvenli offset kullan: absolute left-3 top-3 (ya da sol girintisi pl-8 olan elemanın içinde absolute left-2)."
// But if I put `border-l-2` inside the scroll container, the negative left is fine because it doesn't cross the overflow boundary.

fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', cardContent, 'utf8');
console.log("Updated GitHubIntegrationCard.tsx");
