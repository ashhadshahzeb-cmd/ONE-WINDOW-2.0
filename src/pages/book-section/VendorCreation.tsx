import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Save, RotateCcw, Loader2, Search, Plus, Trash2, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomField {
  id: string;
  name: string;
  value: string;
}

interface CompanyField {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  vendor_name: string;
  email: string;
  phone_no: string;
  cnic_no: string;
  ntn_no: string;
  companies: CompanyField[];
  custom_fields: CustomField[];
}

export default function VendorCreation() {
  // Form States
  const [vendorName, setVendorName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [cnicNo, setCnicNo] = useState("");
  const [ntnNo, setNtnNo] = useState("");
  
  const [companies, setCompanies] = useState<CompanyField[]>([{ id: Date.now().toString(), name: "" }]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReset = (silent = false) => {
    setVendorName("");
    setEmail("");
    setPhoneNo("");
    setCnicNo("");
    setNtnNo("");
    setCompanies([{ id: Date.now().toString(), name: "" }]);
    setCustomFields([]);
    setSearchQuery("");
    setErrors({});
    if (!silent) toast.info("Form reset successfully.");
  };

  const addCompanyField = () => {
    setCompanies([...companies, { id: Date.now().toString(), name: "" }]);
  };

  const removeCompanyField = (id: string) => {
    if (companies.length === 1) {
      setCompanies([{ id: Date.now().toString(), name: "" }]);
      return;
    }
    setCompanies(companies.filter(c => c.id !== id));
  };

  const updateCompanyField = (id: string, newName: string) => {
    setCompanies(companies.map(c => 
      c.id === id ? { ...c, name: newName } : c
    ));
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { id: Date.now().toString(), name: "", value: "" }]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };

  const updateCustomField = (id: string, key: "name" | "value", newValue: string) => {
    setCustomFields(customFields.map(field => 
      field.id === id ? { ...field, [key]: newValue } : field
    ));
  };

  const handleSave = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!vendorName.trim()) newErrors.vendorName = "Vendor Name is required";
    if (!phoneNo.trim()) newErrors.phoneNo = "Phone No is required";
    if (!cnicNo.trim()) newErrors.cnicNo = "CNIC No is required";
    
    // Validate custom fields
    let hasCustomFieldErrors = false;
    customFields.forEach(field => {
      if (!field.name.trim()) hasCustomFieldErrors = true;
    });

    if (hasCustomFieldErrors) {
      toast.error("Please provide names for all custom extra fields.");
      return;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(`${Object.keys(newErrors).length} required field(s) incomplete!`);
      return;
    }
    setErrors({});

    setIsSaving(true);
    try {
      // 1. Check if Vendor exists with same CNIC or Phone No
      const { data: existingVendor } = await supabase
        .from('vendors' as any)
        .select('id')
        .or(`cnic_no.eq.${cnicNo},phone_no.eq.${phoneNo}`)
        .maybeSingle();

      const vendorData = {
        vendor_name: vendorName,
        email: email,
        phone_no: phoneNo,
        cnic_no: cnicNo,
        ntn_no: ntnNo,
        companies: companies,
        custom_fields: customFields
      };

      let error;
      if (existingVendor) {
        // Update existing vendor
        const res = await supabase.from('vendors' as any).update(vendorData).eq('id', existingVendor.id);
        error = res.error;
      } else {
        // Insert new vendor
        const res = await supabase.from('vendors' as any).insert([vendorData]);
        error = res.error;
      }

      if (error) throw error;
      
      toast.success("Vendor saved successfully to database!");
      handleReset(true);
    } catch (err: any) {
      toast.error("Error saving vendor: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      toast.warning("Please enter CNIC, Phone, NTN or Name to search!");
      return;
    }

    setIsSearching(true);
    
    try {
      const query = searchQuery.trim();
      
      // Search across multiple columns
      const { data, error } = await supabase
        .from('vendors' as any)
        .select('*')
        .or(`cnic_no.like.%${query}%,phone_no.like.%${query}%,ntn_no.like.%${query}%,vendor_name.like.%${query}%`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVendorName(data.vendor_name || "");
        setEmail(data.email || "");
        setPhoneNo(data.phone_no || "");
        setCnicNo(data.cnic_no || "");
        setNtnNo(data.ntn_no || "");
        
        // Parse JSONB arrays (Supabase client returns them directly as arrays/objects)
        const parsedCompanies = Array.isArray(data.companies) && data.companies.length > 0 
          ? data.companies as CompanyField[] 
          : [{ id: Date.now().toString(), name: "" }];
          
        const parsedCustomFields = Array.isArray(data.custom_fields) 
          ? data.custom_fields as CustomField[] 
          : [];

        setCompanies(parsedCompanies);
        setCustomFields(parsedCustomFields);
        
        setErrors({});
        toast.success("Vendor record found in database!");
      } else {
        toast.error("No vendor record found with that information.");
      }
    } catch (err: any) {
      toast.error("Search failed: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold italic tracking-tight text-white/90">Vendor Creation</h1>
          <p className="text-sm text-muted-foreground italic">Register new vendors in the One-Window system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleReset()} className="gap-2 border-primary/20 hover:bg-primary/5">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90 font-bold">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            Save Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="glass-card overflow-hidden border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <div className="h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 font-bold italic text-white/80">
                <Users className="w-5 h-5 text-primary" />
                Vendor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="vendorName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Name Of Vendor <span className="text-red-400">*</span></Label>
                <Input
                  id="vendorName"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Enter full name of vendor"
                  className={`bg-white/5 border-white/10 text-white${errors.vendorName ? ' border-red-500' : ''}`}
                />
                {errors.vendorName && <p className="text-xs text-red-400 mt-1">{errors.vendorName}</p>}
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Company / Organization Names
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={addCompanyField}
                    className="h-6 text-[10px] gap-1 hover:text-primary hover:bg-primary/10 text-muted-foreground"
                  >
                    <Plus className="w-3 h-3" /> Add Another Company
                  </Button>
                </div>
                {companies.map((company, index) => (
                  <div key={company.id} className="flex items-center gap-2">
                    <Input
                      value={company.name}
                      onChange={(e) => updateCompanyField(company.id, e.target.value)}
                      placeholder={`Company ${index + 1} (e.g. ABC Traders LLC)`}
                      className="bg-white/5 border-white/10 text-white flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompanyField(company.id)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-white/5 border-white/10 text-white" 
                  placeholder="vendor@example.com" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Phone No <span className="text-red-400">*</span></Label>
                <Input 
                  id="phoneNo" 
                  value={phoneNo} 
                  onChange={(e) => setPhoneNo(e.target.value)} 
                  className={`bg-white/5 border-white/10 text-white font-mono${errors.phoneNo ? ' border-red-500' : ''}`} 
                  placeholder="0300-1234567" 
                />
                {errors.phoneNo && <p className="text-xs text-red-400 mt-1">{errors.phoneNo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnicNo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">CNIC No <span className="text-red-400">*</span></Label>
                <Input 
                  id="cnicNo" 
                  value={cnicNo} 
                  onChange={(e) => setCnicNo(e.target.value)} 
                  className={`bg-white/5 border-white/10 text-white font-mono${errors.cnicNo ? ' border-red-500' : ''}`} 
                  placeholder="42101-1234567-1" 
                />
                {errors.cnicNo && <p className="text-xs text-red-400 mt-1">{errors.cnicNo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ntnNo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">NTN No</Label>
                <Input 
                  id="ntnNo" 
                  value={ntnNo} 
                  onChange={(e) => setNtnNo(e.target.value)} 
                  className="bg-white/5 border-white/10 text-white font-mono" 
                  placeholder="1234567-8" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Custom Fields Section */}
          <Card className="glass-card overflow-hidden border-none shadow-2xl bg-white/5 backdrop-blur-md">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 font-bold italic text-white/80">
                <Plus className="w-5 h-5 text-emerald-400" />
                Extra Information
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addCustomField}
                className="gap-2 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                <Plus className="w-4 h-4" /> Add Field
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {customFields.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm italic border border-dashed border-white/10 rounded-xl">
                  No extra fields added. Click "Add Field" to add custom information.
                </div>
              ) : (
                <div className="space-y-4">
                  {customFields.map((field, index) => (
                    <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end p-4 bg-black/20 rounded-xl border border-white/5 relative group">
                      <div className="space-y-2 flex-1 w-full">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Field Name</Label>
                        <Input 
                          value={field.name}
                          onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                          placeholder="e.g. Sales Tax No, Address, Website"
                          className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30"
                        />
                      </div>
                      <div className="space-y-2 flex-1 w-full">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Value</Label>
                        <Input 
                          value={field.value}
                          onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                          placeholder="Enter value"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomField(field.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 shrink-0 md:mb-0 mb-4 absolute right-2 top-2 md:relative md:right-0 md:top-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card overflow-hidden border-none shadow-inner bg-gradient-to-b from-primary/10 to-transparent border-t border-primary/10">
            <CardHeader>
              <CardTitle className="text-xs font-black text-primary/80 tracking-[0.2em] italic uppercase">SEARCH VENDOR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                 <Input 
                   placeholder="Enter Name, CNIC, NTN or Company..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="bg-black/40 border-primary/20 text-white placeholder:text-muted-foreground/40 font-mono text-xs" 
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-black uppercase text-[10px] tracking-[0.3em] h-10 shadow-lg"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Search className="w-3.5 h-3.5 mr-2" />} Execute
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
