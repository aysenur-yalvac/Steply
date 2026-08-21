const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

actions = actions.replace(
  "if (userError || !user) {\n      return { success: false, error: 'Oturum acmis bir kullanici bulunamadi.' };\n    }",
  "if (userError || !user) {\n      console.error('Auth Error:', userError);\n      return { success: false, error: 'Oturum kapali veya Auth User bulunamadi.' };\n    }"
);

fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated actions.ts");
