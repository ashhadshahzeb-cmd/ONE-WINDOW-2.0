import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAppConfig } from "@/hooks/useAppConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, TrendingDown, ArrowRight, Loader2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function BudgetControl() {
  const { sections, isLoading: isConfigLoading } = useAppConfig();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [utilizations, setUtilizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form State
  const [selectedSection, setSelectedSection] = useState("");
  const [periodType, setPeriodType] = useState("Yearly");
  const [periodValue, setPeriodValue] = useState(new Date().getFullYear().toString());
  const [allocatedAmount, setAllocatedAmount] = useState("");

  const openNewDialog = () => {
    setEditingBudgetId(null);
    setSelectedSection("");
    setPeriodType("Yearly");
    setPeriodValue(new Date().getFullYear().toString());
    setAllocatedAmount("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (budget: any) => {
    setEditingBudgetId(budget.id);
    setSelectedSection(budget.section_key);
    setPeriodType(budget.period_type);
    setPeriodValue(budget.period_value);
    setAllocatedAmount(String(budget.allocated_amount));
    setIsDialogOpen(true);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Budgets
      const { data: budgetData, error: budgetError } = await supabase
        .from('department_budgets' as any)
        .select('*');
      
      if (budgetError) {
        if (budgetError.code === '42P01') {
          console.warn("Table department_budgets does not exist yet. Please run the SQL schema.");
        } else {
          throw budgetError;
        }
      } else {
        setBudgets(budgetData || []);
      }

      // Fetch Utilizations (Aggregated)
      const { data: utilData, error: utilError } = await supabase
        .from('budget_utilizations' as any)
        .select('section_key, deducted_amount, status');

      if (!utilError) {
        setUtilizations(utilData || []);
      }

    } catch (error: any) {
      console.error("Error fetching budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection || !allocatedAmount) return;

    setIsAssigning(true);
    try {
      const amount = parseFloat(allocatedAmount);

      if (editingBudgetId) {
        // UPDATE existing budget
        const { error } = await supabase
          .from('department_budgets' as any)
          .update({ allocated_amount: amount, period_type: periodType, period_value: periodValue, updated_at: new Date().toISOString() })
          .eq('id', editingBudgetId);
        if (error) throw error;
        toast.success("Budget updated successfully!");
      } else {
        // INSERT new budget
        const { error } = await supabase
          .from('department_budgets' as any)
          .upsert({
            section_key: selectedSection,
            period_type: periodType,
            period_value: periodValue,
            allocated_amount: amount
          }, { onConflict: 'section_key, period_type, period_value' });
        if (error) throw error;
        toast.success("Budget assigned successfully!");
      }

      setIsDialogOpen(false);
      setAllocatedAmount("");
      setEditingBudgetId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save budget");
    } finally {
      setIsAssigning(false);
    }
  };

  const calculateSectionStats = (sectionKey: string) => {
    const budget = budgets.find(b => b.section_key === sectionKey);
    const allocated = budget ? Number(budget.allocated_amount) : 0;
    
    // Sum all active deductions
    const sectionUtils = utilizations.filter(u => u.section_key === sectionKey && u.status !== 'Reverted');
    const utilized = sectionUtils.reduce((sum, u) => sum + Number(u.deducted_amount), 0);
    
    const remaining = allocated - utilized;
    const percentage = allocated > 0 ? (utilized / allocated) * 100 : 0;

    return { allocated, utilized, remaining, percentage, hasBudget: !!budget };
  };

  if (isConfigLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter out system sections
  const validSections = sections.filter(s => s.config_key !== 'admin' && s.config_key !== 'file_viewer');

  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocated_amount), 0);
  const totalUtilized = utilizations.filter(u => u.status !== 'Reverted').reduce((sum, u) => sum + Number(u.deducted_amount), 0);
  const globalPercentage = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            Budget Control Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track departmental budget allocations in real-time.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20" onClick={openNewDialog}>
              <Plus className="w-5 h-5 mr-2" /> Assign Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBudgetId ? 'Edit Budget' : 'Assign Department Budget'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignBudget} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Department / Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!!editingBudgetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {validSections.map(s => (
                      <SelectItem key={s.config_key} value={s.config_key}>{s.config_label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select value={periodType} onValueChange={setPeriodType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year/Month</Label>
                  <Input value={periodValue} onChange={e => setPeriodValue(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allocated Amount (PKR)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  required 
                  value={allocatedAmount} 
                  onChange={e => setAllocatedAmount(e.target.value)} 
                  placeholder="e.g. 5000000"
                />
              </div>

              <Button type="submit" className="w-full font-bold" disabled={isAssigning}>
                {isAssigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingBudgetId ? 'Update Budget' : 'Save Budget'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-background/60 border-primary/20 shadow-xl shadow-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Allocated Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">Rs. {totalAllocated.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-background/60 border-border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Utilized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-expense flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Rs. {totalUtilized.toLocaleString()}
            </div>
            <Progress value={globalPercentage} className="h-1.5 mt-4" indicatorClassName="bg-expense" />
          </CardContent>
        </Card>

        <Card className="bg-background/60 border-border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">Rs. {(totalAllocated - totalUtilized).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-white mt-8 mb-4">Department Breakdowns</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {validSections.map(section => {
            const stats = calculateSectionStats(section.config_key);
            if (!stats.hasBudget && stats.utilized === 0) return null; // Hide if no budget and no usage

            const progressColor = stats.percentage > 90 ? 'bg-red-500' : stats.percentage > 75 ? 'bg-orange-500' : 'bg-primary';

            return (
              <Card key={section.config_key} className="bg-background border border-border/50 hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1 h-full ${progressColor}`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold">{section.config_label}</CardTitle>
                      <CardDescription className="text-xs uppercase tracking-wider mt-1">{section.config_key}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          const existingBudget = budgets.find(b => b.section_key === section.config_key);
                          if (existingBudget) openEditDialog(existingBudget);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Badge variant={stats.percentage > 90 ? "destructive" : "secondary"}>
                        {stats.percentage.toFixed(1)}% Used
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Allocated</p>
                      <p className="font-mono font-medium text-sm">Rs. {stats.allocated.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Remaining</p>
                      <p className={`font-mono font-bold text-sm ${stats.remaining < 0 ? 'text-red-500' : 'text-primary'}`}>
                        Rs. {stats.remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Utilized</span>
                      <span>Rs. {stats.utilized.toLocaleString()}</span>
                    </div>
                    <Progress value={stats.percentage} className="h-2" indicatorClassName={progressColor} />
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full mt-2 text-xs text-muted-foreground hover:text-white group-hover:bg-white/5"
                    onClick={() => navigate(`/budget-details/${section.config_key}`)}
                  >
                    View File Deductions <ArrowRight className="w-3 h-3 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {validSections.filter(s => !calculateSectionStats(s.config_key).hasBudget && calculateSectionStats(s.config_key).utilized === 0).length > 0 && (
            <Card className="bg-background/20 border-dashed border-border/50 flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
              <Wallet className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Other departments have no budget allocated yet.</p>
              <Button variant="link" className="text-primary mt-1" onClick={openNewDialog}>Assign Budget</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
