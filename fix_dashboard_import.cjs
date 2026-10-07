const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
    `import { Bell, Calendar, Users, Wallet, FileText, UserCheck, UserX, ChevronRight, BarChart } from "lucide-react";`,
    `import { Bell, Calendar, Users, Wallet, FileText, UserCheck, UserX, ChevronRight, BarChart, Book } from "lucide-react";`
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
