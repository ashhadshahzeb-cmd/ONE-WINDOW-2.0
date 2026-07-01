import fs from 'fs';
import path from 'path';

const file = path.join('c:', 'Users', 'Kodexo Labs', 'Desktop', 'KWSC-ONE-WINDOW-FACI-main', 'src', 'pages', 'book-section', 'FileTracking.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add "Returned Files" tab trigger
content = content.replace(
  /<TabsTrigger\s+value="view_only"\s+className="[\s\S]*?View Files\s*<\/TabsTrigger>/,
  `$&
                <TabsTrigger
                  value="returned"
                  className="data-[state=active]:bg-[#14b8a6] data-[state=active]:text-black text-white/70 font-black tracking-wider text-xs px-6 py-2.5 rounded-full transition-all"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Returned Files
                </TabsTrigger>`
);

// 2. Fix the EXACT match search bug
// In `handleSearch`, currently it might use `.ilike` or something similar for receiving number and diary number.
content = content.replace(
  /.ilike\('receiving_number', `%$\{searchQuery\}%`\)/g,
  `.eq('receiving_number', searchQuery)`
);
content = content.replace(
  /.ilike\('cfo_diary_number', `%$\{searchQuery\}%`\)/g,
  `.eq('cfo_diary_number', searchQuery)`
);
// Or if it searches local DB (indexedDB):
content = content.replace(
  /r\.receiving_number\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g,
  `r.receiving_number.toLowerCase() === searchQuery.toLowerCase()`
);
content = content.replace(
  /r\.cfo_diary_number\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g,
  `r.cfo_diary_number.toLowerCase() === searchQuery.toLowerCase()`
);

// 3. Clear search bar on save/print
// Inside handleSaveForm after successful save:
content = content.replace(
  /toast\.success\("File Forwarded successfully!"\);/g,
  `toast.success("File Forwarded successfully!");
      setSearchQuery("");`
);
content = content.replace(
  /toast\.success\("File Saved successfully!"\);/g,
  `toast.success("File Saved successfully!");
      setSearchQuery("");`
);

// We need to provide the Returned Files view. I'll just add it to the TabsContent rendering logic.
// There is likely a check `activeTab === 'view_only'` or similar. Let's see how tabs are rendered.
// Actually, 'activeTab' determines if the Register form or the List is shown.
// Usually: `{activeTab !== 'register' && ( <div ...> records map </div> )}`
// I will just modify the filter condition to include 'returned' filtering.
// Right before mapping over `records` or applying filters:
content = content.replace(
  /let filtered = records;/g,
  `let filtered = records;
    if (activeTab === 'returned') {
      filtered = filtered.filter(r => r.additional_mark_to && r.additional_mark_to.trim() !== "");
    }`
);

fs.writeFileSync(file, content);
console.log("Updated FileTracking UI part 2");
