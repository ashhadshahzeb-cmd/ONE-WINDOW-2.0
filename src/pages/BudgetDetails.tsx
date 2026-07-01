import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAppConfig } from "@/hooks/useAppConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BudgetDetails() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { sections, isLoading: isConfigLoading } = useAppConfig();
  
  const [budget, setBudget] = useState<any>(null);
  const [utilizations, setUtilizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!sectionId) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch budget config
        const { data: budgetData } = await supabase
          .from('department_budgets' as any)
          .select('*')
          .eq('section_key', sectionId)
          .maybeSingle();
        
        if (budgetData) setBudget(budgetData);

        // Fetch utilizations with joined file data
        const { data: utilData, error: utilError } = await supabase
          .from('budget_utilizations' as any)
          .select(`
            *,
            file_tracking_records (
              cfo_diary_number,
              receiving_number,
              subject,
              received_from,
              created_at
            )
          `)
          .eq('section_key', sectionId)
          .order('created_at', { ascending: false });

        if (utilError) {
          console.warn("Could not fetch utilizations. Did you run the SQL script?", utilError);
        } else {
          setUtilizations(utilData || []);
        }

      } catch (err) {
        console.error("Error fetching budget details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [sectionId]);

  if (isConfigLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sectionName = sections.find(s => s.config_key === sectionId)?.config_label || sectionId;
  const allocated = budget ? Number(budget.allocated_amount) : 0;
  const activeUtils = utilizations.filter(u => u.status !== 'Reverted');
  const utilizedAmount = activeUtils.reduce((sum, u) => sum + Number(u.deducted_amount), 0);
  const remaining = allocated - utilizedAmount;

  const filteredUtils = utilizations.filter(u => {
    const file = u.file_tracking_records || {};
    const q = search.toLowerCase();
    return (
      (file.cfo_diary_number || '').toLowerCase().includes(q) ||
      (file.receiving_number || '').toLowerCase().includes(q) ||
      (file.subject || '').toLowerCase().includes(q) ||
      (file.received_from || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <Button variant="ghost" className="mb-2 text-muted-foreground hover:text-white" onClick={() => navigate('/budget-control')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Overview
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            {sectionName} Budget Details
          </h1>
          <p className="text-muted-foreground mt-1">Detailed view of all files impacting this department's budget.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-background/60 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">Rs. {allocated.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-background/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Utilized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-expense">Rs. {utilizedAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black ${remaining < 0 ? 'text-red-500' : 'text-white'}`}>
              Rs. {remaining.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Tracking Deductions Table */}
      <Card className="bg-background border border-border shadow-xl">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              File Deductions Ledger
            </CardTitle>
            <CardDescription>A chronological list of all files that deducted from this budget.</CardDescription>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search diary no, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Diary / Receiving</TableHead>
                  <TableHead>Subject / Payee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Deducted Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUtils.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No files have impacted this department's budget yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUtils.map((util) => {
                    const file = util.file_tracking_records || {};
                    const isReverted = util.status === 'Reverted';
                    const isAdjustment = util.status === 'Adjustment';
                    
                    return (
                      <TableRow key={util.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {new Date(util.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm font-bold">{file.cfo_diary_number || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{file.receiving_number || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium max-w-md truncate">{file.subject || 'Unknown Subject'}</div>
                          <div className="text-xs text-muted-foreground">{file.received_from || 'Unknown Payee'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isReverted ? 'outline' : isAdjustment ? 'secondary' : 'default'} 
                                 className={isReverted ? 'text-muted-foreground' : isAdjustment ? 'bg-blue-500/10 text-blue-500' : 'bg-expense/10 text-expense'}>
                            {util.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-mono font-bold ${isReverted ? 'text-muted-foreground line-through' : 'text-white'}`}>
                          {Number(util.deducted_amount) > 0 ? '-' : '+'} Rs. {Math.abs(Number(util.deducted_amount)).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
