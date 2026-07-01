import fs from 'fs';
import path from 'path';

const file = path.join('c:', 'Users', 'Kodexo Labs', 'Desktop', 'KWSC-ONE-WINDOW-FACI-main', 'src', 'pages', 'book-section', 'FileTracking.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Update formData initial state
content = content.replace(
  /const \[formData, setFormData\] = useState\(\{([\s\S]*?)vehicle_no: "",\s*\}\);/,
  `const [formData, setFormData] = useState({$1vehicle_no: "",
    department_number: "",
    no_amount: false,
    subject_prefix: "",
    fuel_station: "",
    additional_mark_to: "",
  });`
);

// 2. Update fetchNextDiaryNumber
const fetchNextCode = `  const fetchNextDiaryNumber = async () => {
    const year = "2627"; // Changed from 2026 to 2627
    const prefix = \`CFO-\${year}-\${(currentRole || 'cfo').toUpperCase()}\`;
    const { data, error } = await supabase
      .from('file_tracking_records' as any)
      .select('cfo_diary_number, created_at')
      .like('cfo_diary_number', \`\${prefix}-%\`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data && data.length > 0) {
      const numericParts = data
        .map(d => {
          const parts = d.cfo_diary_number.split('-');
          return parts.length >= 4 ? parseInt(parts[3]) : 0;
        })
        .filter(n => !isNaN(n));

      if (numericParts.length > 0) {
        const maxNo = Math.max(...numericParts);
        const nextNo = \`\${prefix}-\${String(maxNo + 1).padStart(4, '0')}\`;
        setFormData(prev => ({ ...prev, cfo_diary_number: nextNo }));
      } else {
        setFormData(prev => ({ ...prev, cfo_diary_number: \`\${prefix}-0001\` }));
      }
    } else {
      setFormData(prev => ({ ...prev, cfo_diary_number: \`\${prefix}-0001\` }));
    }
  };`;
content = content.replace(/const fetchNextDiaryNumber = async \(\) => \{[\s\S]*?  \};/m, fetchNextCode);

// Write changes
fs.writeFileSync(file, content);
console.log("Updated FileTracking.tsx (part 1)");
