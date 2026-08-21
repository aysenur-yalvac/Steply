const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

actions = actions.replace(
  "revalidatePath('/dashboard/assignments');",
  "revalidatePath('/dashboard/assignments');\n  revalidatePath('/dashboard/assignments', 'page');"
);

fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated actions.ts");
