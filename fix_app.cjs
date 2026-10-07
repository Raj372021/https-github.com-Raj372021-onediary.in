const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('import DraggableWidgets')) {
  code = code.replace(
    `import { AppProvider, useAppContext } from "./context/AppContext";`,
    `import { AppProvider, useAppContext } from "./context/AppContext";\nimport DraggableWidgets from "./components/DraggableWidgets";`
  );

  code = code.replace(
    `      {!hideBottomNav && <BottomNav />}\n    </div>`,
    `      {!hideBottomNav && <BottomNav />}\n      <DraggableWidgets />\n    </div>`
  );

  fs.writeFileSync('src/App.tsx', code);
}
