const fs = require('fs');

let content = fs.readFileSync('src/data/sanskritCompleteData.ts', 'utf8');

content = content.replace(
  /"explanation": "• नारायण = रचयिता नारायण पण्डित\\n• बाघ = व्याघ्रपथिककथा\\n• हित = यह ग्रंथ 'हितोपदेश' से लिया गया है।\\nबाघ ने 'हित' \(फायदे\) की बात करके पथिक को फंसाया\."/,
  `"explanation": "• नारायण = रचयिता नारायण पण्डित\\n• बाघ = व्याघ्रपथिककथा\\n• हित = यह ग्रंथ 'हितोपदेश' से लिया गया है।\\nबाघ ने 'हित' (फायदे) की बात करके पथिक को फंसाया।",
    "example": ""`
);

fs.writeFileSync('src/data/sanskritCompleteData.ts', content);
console.log("Patched trick example");
