const fs = require('fs');
let code = fs.readFileSync('src/pages/More.tsx', 'utf-8');

code = code.replace(
`import { Settings, Globe, Shield, LogOut, ChevronRight, Download, Upload, Trash2, FileText } from 'lucide-react';`,
`import { Settings, Globe, Shield, LogOut, ChevronRight, Download, Upload, Trash2, FileText, Book } from 'lucide-react';`
);

code = code.replace(
`        <Section title="Management">
          <Link to="/reports">
            <MenuItem icon={FileText} title="Salary Sheet & Reports" />
          </Link>`,
`        <Section title="Management">
          <Link to="/diary">
            <MenuItem icon={Book} title="My Diary" subtitle="Daily notes & reminders" />
          </Link>
          <Link to="/reports">
            <MenuItem icon={FileText} title="Salary Sheet & Reports" />
          </Link>`
);

fs.writeFileSync('src/pages/More.tsx', code);
