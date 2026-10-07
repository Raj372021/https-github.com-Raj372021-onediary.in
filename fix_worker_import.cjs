const fs = require('fs');
let code = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf-8');

code = code.replace(
  `import { ArrowLeft, CreditCard, Trash2, Edit } from "lucide-react";`,
  `import { ArrowLeft, CreditCard, Trash2, Edit, Eye, EyeOff } from "lucide-react";`
);

fs.writeFileSync('src/pages/WorkerDetail.tsx', code);
