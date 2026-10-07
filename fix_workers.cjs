const fs = require('fs');
let code = fs.readFileSync('src/pages/Workers.tsx', 'utf-8');

code = code.replace(
  `import { Plus, Users, Search, ChevronRight, Phone, AlertCircle } from "lucide-react";`,
  `import { Plus, Users, Search, ChevronRight, Phone, AlertCircle, BookUser } from "lucide-react";`
);

const oldFormHeader = `<h3 className="font-bold text-gray-900 mb-3">Add Worker</h3>`;
const newFormHeader = `<div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900">Add Worker</h3>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const props = ['name', 'tel'];
                    const opts = { multiple: false };
                    if ('contacts' in navigator) {
                      const contacts = await (navigator as any).contacts.select(props, opts);
                      if (contacts && contacts.length > 0) {
                        const contact = contacts[0];
                        const name = contact.name ? contact.name[0] : '';
                        const phone = contact.tel ? contact.tel[0].replace(/[^0-9+]/g, '') : '';
                        setNewWorker(prev => ({ ...prev, name, phone }));
                      }
                    } else {
                      alert('Contact import is not supported on this device/browser.');
                    }
                  } catch (ex) {
                    console.error(ex);
                  }
                }}
                className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg font-bold flex items-center hover:bg-blue-100 transition-colors"
              >
                <BookUser size={14} className="mr-1" /> Import Contact
              </button>
            </div>`;

code = code.replace(oldFormHeader, newFormHeader);

fs.writeFileSync('src/pages/Workers.tsx', code);
