const fs = require("fs");
let modal = fs.readFileSync("src/components/assignments/CreateAssignmentModal.tsx", "utf8");

modal = modal.replace(
  '<option value="9. Sinif">9. Sinif</option>\n                <option value="10. Sinif">10. Sinif</option>\n                <option value="11. Sinif">11. Sinif</option>\n                <option value="12. Sinif">12. Sinif</option>',
  '<option value="1. Sinif">1. Sinif</option>\n                <option value="2. Sinif">2. Sinif</option>\n                <option value="3. Sinif">3. Sinif</option>\n                <option value="4. Sinif">4. Sinif</option>\n                <option value="Yuksek Lisans / Doktora">Yuksek Lisans / Doktora</option>'
);

fs.writeFileSync("src/components/assignments/CreateAssignmentModal.tsx", modal, "utf8");
console.log("Updated CreateAssignmentModal.tsx");
