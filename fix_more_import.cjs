const fs = require('fs');
let code = fs.readFileSync('src/pages/More.tsx', 'utf-8');

code = code.replace(
`import { User, Lock, Shield, Settings, Globe, Bell, CreditCard, Clock, HelpCircle, FileText, LogOut, ChevronRight, X } from "lucide-react";`,
`import { User, Lock, Shield, Settings, Globe, Bell, CreditCard, Clock, HelpCircle, FileText, LogOut, ChevronRight, X, Book } from "lucide-react";`
);

fs.writeFileSync('src/pages/More.tsx', code);
