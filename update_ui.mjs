import fs from 'fs';
import path from 'path';

const file = path.join('c:', 'Users', 'Kodexo Labs', 'Desktop', 'KWSC-ONE-WINDOW-FACI-main', 'src', 'pages', 'book-section', 'FileTracking.tsx');
let content = fs.readFileSync(file, 'utf8');

// A. Add Department Number next to Receiving Number
content = content.replace(
  /<div className="space-y-2">\s*<Label className="text-xs uppercase font-bold text-muted-foreground">Receiving Number[\s\S]*?<\/div>/,
  `$&
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Department Number <span className="text-muted-foreground/50 text-[10px]">(Optional)</span></Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4 w-4 text-[#14b8a6]" />
                  </div>
                  <Input
                    placeholder="e.g. DEPT-123"
                    className="pl-10 bg-background/50 border-white/10 text-white font-mono h-11 focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] transition-all rounded-xl"
                    value={formData.department_number || ""}
                    onChange={e => setFormData({ ...formData, department_number: e.target.value })}
                  />
                </div>
              </div>`
);

// B. Subject Prefix Dropdown
content = content.replace(
  /<div className="space-y-2">\s*<Label className="text-xs uppercase font-bold text-muted-foreground">Subject[\s\S]*?<div className="relative group">[\s\S]*?<FileText className="h-4 w-4 text-\[#14b8a6\]" \/>[\s\S]*?<\/div>\s*<Input[\s\S]*?value=\{formData\.subject\}[\s\S]*?onChange=\{e => setFormData\(\{ \.\.\.formData, subject: e\.target\.value \}\)\}[\s\S]*?\/>\s*<\/div>\s*<\/div>/,
  `<div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Subject <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Select value={formData.subject_prefix} onValueChange={v => setFormData({ ...formData, subject_prefix: v })}>
                    <SelectTrigger className="w-[100px] bg-background/50 border-white/10 text-white h-11 focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] transition-all rounded-xl">
                      <SelectValue placeholder="Prefix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr. ">Mr.</SelectItem>
                      <SelectItem value="Miss. ">Miss.</SelectItem>
                      <SelectItem value="Mrs. ">Mrs.</SelectItem>
                      <SelectItem value="M/s. ">M/s.</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-4 w-4 text-[#14b8a6]" />
                    </div>
                    <Input
                      placeholder="Enter subject"
                      className="pl-10 bg-background/50 border-white/10 text-white font-medium h-11 focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] transition-all rounded-xl"
                      value={formData.subject}
                      onChange={e => {
                         const val = e.target.value;
                         // Prevent prefix doubling if they type it, but normally they just type name.
                         setFormData({ ...formData, subject: val });
                      }}
                    />
                  </div>
                </div>
              </div>`
);

// C. Amount Checkbox
content = content.replace(
  /<div className="space-y-2">\s*<Label className="text-xs uppercase font-bold text-\[#14b8a6\]">Amount \(PKR\) <span className="text-xs text-\[#14b8a6\]\/60 font-medium">\(NET AMOUNT\)<\/span><\/Label>\s*<div className="relative group">/,
  `<div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase font-bold text-[#14b8a6]">Amount (PKR) <span className="text-xs text-[#14b8a6]/60 font-medium">(NET AMOUNT)</span></Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="no_amount" checked={formData.no_amount} onCheckedChange={(c) => setFormData({ ...formData, no_amount: !!c, amount: c ? 0 : formData.amount })} />
                    <label htmlFor="no_amount" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/70">No Amount</label>
                  </div>
                </div>
                <div className="relative group">`
);

// Disable amount field if no_amount
content = content.replace(
  /<Input\s*type="number"\s*placeholder="0"\s*className="pl-10 bg-background\/50 border-white\/10 text-\[#14b8a6\] font-black text-lg h-12 focus:border-\[#14b8a6\] focus:ring-1 focus:ring-\[#14b8a6\] transition-all rounded-xl"\s*value=\{formData\.amount \|\| ""\}\s*onChange=\{e => setFormData\(\{ \.\.\.formData, amount: Number\(e\.target\.value\) \}\)\}\s*\/>/,
  `<Input
                    type="number"
                    placeholder="0"
                    disabled={formData.no_amount}
                    className="pl-10 bg-background/50 border-white/10 text-[#14b8a6] font-black text-lg h-12 focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] transition-all rounded-xl disabled:opacity-50"
                    value={formData.amount || ""}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />`
);

// D. POL Bills Fuel Station
// We need to inject the fuel station logic in the sub-category area
const fuelStations = [
  "ISHA SERVICE STATION", "ALLIED PETROLIUM SERVICE", "AWAMI FILLING STATION", "BANBHORE FILLING STATION",
  "BROTHERS SERVICE STATION", "CENTRAL SERVICE STATION", "DILAWAR GESOLINE", "FAISAL FILLING STATION",
  "FANCY SERVICE STATION", "KARACHI SERVICE STATION", "KARIMI AUTOMOBILE SERVICE", "LANDHI GASOLINE SERVICES",
  "MACCA MOBILE SERVICE", "MADINA FILLING STATION", "MADINA SERVICE STATION EJAZ", "MADINA SERVICES STATION YASIR",
  "MANSOOR SERVICE STATION", "MUGHAL PETROLEUM SERVICES", "NOOR PETROLIUM SERVICE", "PAK PETROLEUM SERVICE",
  "PSO FLEET CARD", "Q STAR PETROLEUM SERVICE", "ROSHAN SERVICE STATION", "STADIUM SERVICE STATION",
  "SUPER SERVICE STATION", "UNITED FILLING STATION"
];
const fuelStationOptions = fuelStations.map(fs => `<SelectItem value="${fs}">${fs}</SelectItem>`).join('\\n');

content = content.replace(
  /\{formData\.mainCategory && getSubCategoriesFor\(formData\.mainCategory\)\.length > 0 && \([\s\S]*?<\/Select>\s*<\/div>\s*<\/div>\s*\)\}/,
  `{(formData.mainCategory === 'pol-bills' || formData.mainCategory === 'POL Bills') ? (
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Fuel Station</Label>
                <div className="relative">
                  <Select value={formData.fuel_station || formData.subCategory} onValueChange={v => setFormData({ ...formData, fuel_station: v, subCategory: v })}>
                    <SelectTrigger className="w-full bg-background/50 border-white/10 text-white h-11 focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] transition-all rounded-xl">
                      <SelectValue placeholder="Select fuel station" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      ${fuelStationOptions}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : formData.mainCategory && getSubCategoriesFor(formData.mainCategory).length > 0 && (
              $&
            )}`
);

// E. Add Print Duplicate Watermark check in report generation
// We'll add a new state `isDuplicatePrint`
content = content.replace(
  /const \[coveringSlipCreatedDate, setCoveringSlipCreatedDate\] = useState\(getLocalDateString\(\)\);/,
  `const [coveringSlipCreatedDate, setCoveringSlipCreatedDate] = useState(getLocalDateString());
  const [isDuplicatePrint, setIsDuplicatePrint] = useState(false);`
);

content = content.replace(
  /<div className="report-header">/,
  `\${isDuplicatePrint ? '<div style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%) rotate(-45deg); font-size:150px; color:rgba(200,200,200,0.15); pointer-events:none; z-index:9999;">DUPLICATE</div>' : ''}
          <div className="report-header">`
);

// We need a checkbox for this in the print modal or near the print button. Let's add it near "Generate Report"
content = content.replace(
  /<Button onClick=\{\(\) => handlePrintFullReport\(records\)\} className="w-full bg-amber-500 hover:bg-amber-600 text-white">/,
  `<div className="flex items-center space-x-2 py-2">
                    <Checkbox id="duplicate_print" checked={isDuplicatePrint} onCheckedChange={(c) => setIsDuplicatePrint(!!c)} />
                    <label htmlFor="duplicate_print" className="text-xs font-medium leading-none text-white/70">Print as Duplicate</label>
                  </div>
                  $&`
);

// F. Find & Edit / QR Modal: Add Additional Mark To and Remarks
// Update Qr modal
content = content.replace(
  /const handleExitFile = async \(file: any\) => \{/,
  `const [additionalMarkTo, setAdditionalMarkTo] = useState("");
  const [exitRemarks, setExitRemarks] = useState("");
  
  const handleExitFile = async (file: any) => {`
);

content = content.replace(
  /mark_to: 'exited',/,
  `mark_to: additionalMarkTo || 'exited',
        additional_mark_to: additionalMarkTo,
        remarks: exitRemarks ? (file.remarks ? file.remarks + ' | ' + exitRemarks : exitRemarks) : file.remarks,`
);

content = content.replace(
  /<DialogTitle className="text-2xl font-black text-amber-500 flex items-center gap-2">/,
  `$&`
);
// It's easier to just modify the Exit / Edit modal manually or with multi_replace_file_content

fs.writeFileSync(file, content);
console.log("Updated FileTracking UI parts");
