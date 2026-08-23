const fs = require("fs");
let content = fs.readFileSync("src/app/page.tsx", "utf8");

// 1. Add Tilt3DCard import
content = content.replace(
  `import LiveDemo from "@/components/demo/LiveDemo";`,
  `import LiveDemo from "@/components/demo/LiveDemo";
import Tilt3DCard from "@/components/ui/Tilt3DCard";`
);

// 2. Replace FEATURE CARDS section — find and wrap feature cards with Tilt3DCard
const oldFeatureCard = `            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:-translate-y-1 duration-300"
              style={{
                background: item.color.track,
                border: \`1px solid \${item.color.bar}22\`,
              }}
            >`;

const newFeatureCard = `            <Tilt3DCard
              key={i}
              className="rounded-2xl"
              style={{
                background: item.color.track,
                border: \`1px solid \${item.color.bar}22\`,
              }}
            >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl duration-300"
            >`;

content = content.replace(oldFeatureCard, newFeatureCard);

// Also close the Tilt3DCard — find the closing tag pattern
const oldFeatureClose = `            </motion.div>
          ))}`;
const newFeatureClose = `            </motion.div>
            </Tilt3DCard>
          ))}`;

// Only replace the first occurrence (feature cards section) not others
const firstIdx = content.indexOf(oldFeatureClose);
if (firstIdx >= 0) {
  content = content.slice(0, firstIdx) + newFeatureClose + content.slice(firstIdx + oldFeatureClose.length);
}

fs.writeFileSync("src/app/page.tsx", content, "utf8");
console.log("page.tsx updated with Tilt3DCard");
console.log("Has Tilt3DCard import:", content.includes("Tilt3DCard"));
