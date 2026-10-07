const fs = require('fs');
let content = fs.readFileSync('src/pages/WorkerDetail.tsx', 'utf8');

const t = `        ))}
      <div className="fixed bottom-0 left-0`;

const r = `        ))}
      </div>
      <div className="fixed bottom-0 left-0`;

content = content.replace(t, r);
fs.writeFileSync('src/pages/WorkerDetail.tsx', content);
