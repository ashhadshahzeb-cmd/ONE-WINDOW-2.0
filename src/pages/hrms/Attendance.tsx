import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Activity, Clock, LogIn, LogOut, CheckCircle2, Search, Camera, X, Download } from 'lucide-react';
import { format, differenceInMinutes, parseISO, subDays, isSameDay } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

import { useAuth } from '@/contexts/AuthContext';

const OFFICE_LAT = 24.898287250826936;
const OFFICE_LNG = 67.07303610170393;
const ALLOWED_RADIUS_METERS = 500;
const SHIFT_CONFIG: Record<string, { start: string, end: string, requiredHours: number }> = {
   "Shayan Siraj": { start: "10:00", end: "17:00", requiredHours: 7 },
   "Azeem Danish": { start: "10:00", end: "17:00", requiredHours: 7 },
   "Afifa": { start: "10:00", end: "17:00", requiredHours: 7 },
   "Ashhad": { start: "10:00", end: "17:00", requiredHours: 7 },
   "Taha Naeem": { start: "10:00", end: "17:00", requiredHours: 7 },
   "Syed Mohammad Ali": { start: "10:00", end: "17:00", requiredHours: 7 },
   "Noor": { start: "10:00", end: "17:00", requiredHours: 7 },
   "Hassan Naeem": { start: "10:00", end: "15:00", requiredHours: 5 },
   "Salman Hussein Khan": { start: "10:00", end: "15:00", requiredHours: 5 },
   "Farooq": { start: "10:00", end: "15:00", requiredHours: 5 },
   "Mubashir": { start: "15:00", end: "20:00", requiredHours: 5 },
   "Umer Naeem": { start: "15:00", end: "20:00", requiredHours: 5 }
};

const DEFAULT_SHIFT = { start: "10:00", end: "17:00", requiredHours: 7 };

function getEmployeeShift(empName: string) {
   if (!empName) return DEFAULT_SHIFT;
   const found = Object.keys(SHIFT_CONFIG).find(k => k.toLowerCase() === empName.toLowerCase() || empName.toLowerCase().includes(k.toLowerCase()));
   if (found) return SHIFT_CONFIG[found];
   return DEFAULT_SHIFT;
}

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371;
  var dLat = deg2rad(lat2-lat1); 
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  return d * 1000; 
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

function calculateWorkingHours(inTime: string, outTime: string) {
  const diffMs = new Date(outTime).getTime() - new Date(inTime).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function Attendance() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isHRMSEmployee = userRole === 'hrms_employee';
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Admin states
  const [allAttendance, setAllAttendance] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterDept, setFilterDept] = useState('all');

  // Camera removed from state as we use native
  const [actionType, setActionType] = useState<'in' | 'out'>('in');
  const [isProcessing, setIsProcessing] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employees
  useEffect(() => {
    if (isHRMSEmployee) {
      const myId = localStorage.getItem('kwsb_hrms_emp_id');
      if (myId) {
        setSelectedEmpId(myId);
        setLoading(false);
      }
    } else {
      fetchEmployees();
    }
  }, [isHRMSEmployee]);

  // Fetch individual attendance
  useEffect(() => {
    if (selectedEmpId) {
      fetchAttendanceData(selectedEmpId);
    } else {
      setTodayRecord(null);
      setHistory([]);
    }
  }, [selectedEmpId]);

  // Fetch admin records
  useEffect(() => {
    if (!isHRMSEmployee) {
      fetchAllAttendance(attendanceDate);
    }
  }, [attendanceDate, isHRMSEmployee]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('hrms_employees').select('id, name, designation').order('name');
    if (!error && data) setEmployees(data);
    setLoading(false);
  };

  const fetchAttendanceData = async (empId: string) => {
    const todayDate = format(new Date(), 'yyyy-MM-dd');
    
    const { data: todayData } = await supabase
      .from('hrms_attendance')
      .select('*')
      .eq('employee_id', empId)
      .eq('date', todayDate)
      .order('check_in', { ascending: false })
      .limit(1);
      
    setTodayRecord(todayData?.[0] || null);

    const { data: historyData } = await supabase
      .from('hrms_attendance')
      .select('*')
      .eq('employee_id', empId)
      .order('date', { ascending: false })
      .limit(30);
      
    setHistory(historyData || []);
  };

  const fetchAllAttendance = async (dateStr: string) => {
    const { data: emps } = await supabase.from('hrms_employees').select('id, name, designation');
    const { data: atts } = await supabase.from('hrms_attendance').select('*').eq('date', dateStr).order('created_at', { ascending: false });
    
    if (emps) {
      const combined = emps.map(emp => {
        const att = atts?.find(a => a.employee_id === emp.id);
        return {
          ...emp,
          attendance: att || null
        };
      });
      setAllAttendance(combined);
    }
  };

  const verifyLocation = async (): Promise<boolean> => {
    return true; // TEMPORARILY BYPASSED FOR TESTING
  };

  const capturePhoto = async (): Promise<{ url: string | null, errorMsg: string | null }> => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        direction: 'FRONT'
      });

      if (!image || !image.base64String) return { url: null, errorMsg: "No image captured from Camera" };
      
      const byteCharacters = atob(image.base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      const fileName = `${selectedEmpId}_${new Date().getTime()}.jpg`;
      
      const { data, error } = await supabase.storage.from('attendance_selfies').upload(fileName, blob, { contentType: 'image/jpeg' });
      if (error) {
         return { url: null, errorMsg: `Upload Error: ${error.message}` };
      }
      
      const { data: urlData } = supabase.storage.from('attendance_selfies').getPublicUrl(fileName);
      return { url: urlData.publicUrl, errorMsg: null };
    } catch (error: any) {
      console.error("Photo process failed:", error);
      return { url: null, errorMsg: `Process Error: ${error.message || JSON.stringify(error)}` };
    }
  };

  const determineStatus = (checkInTime: Date, empName: string) => {
    const shift = getEmployeeShift(empName);
    const shiftStart = new Date(checkInTime);
    const [h, m] = shift.start.split(':');
    shiftStart.setHours(parseInt(h), parseInt(m), 0);
    
    const lateThreshold = new Date(shiftStart.getTime() + 20 * 60000);
    if (checkInTime > lateThreshold) return 'Late';
    return 'Present';
  };

  const processAttendance = async (type: 'in' | 'out') => {
    setIsProcessing(true);
    let photoUrl = null;

    if (isNative) {
      // Must take photo if native
      const photoResult = await capturePhoto();
      if (!photoResult.url) {
         toast({ title: 'Photo Required', description: photoResult.errorMsg || 'Failed to capture selfie.', variant: 'destructive' });
         setIsProcessing(false);
         return;
      }
      photoUrl = photoResult.url;
    }

    const now = new Date().toISOString();
    const todayDate = format(new Date(), 'yyyy-MM-dd');

    if (type === 'in') {
      const empName = employees.find(e => e.id === selectedEmpId)?.name || '';
      const status = determineStatus(new Date(), empName);
      const { error } = await supabase.from('hrms_attendance').insert([{ 
        employee_id: selectedEmpId, 
        date: todayDate, 
        check_in: now, 
        status: status,
        check_in_photo_url: photoUrl
      }]);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Checked In Successfully!' });
        sendAttendanceNotification(empName, 'in', format(new Date(now), 'hh:mm a'));
      }
    } else {
      const empName = employees.find(e => e.id === selectedEmpId)?.name || '';
      const shift = getEmployeeShift(empName);
      const diffHrs = differenceInMinutes(new Date(), new Date(todayRecord.check_in)) / 60;
      let outStatus = todayRecord.status;
      if (diffHrs <= (shift.requiredHours / 2)) outStatus = 'Half Day';

      const { error } = await supabase.from('hrms_attendance').update({ 
        check_out: now,
        status: outStatus,
        check_out_photo_url: photoUrl
      }).eq('id', todayRecord.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Checked Out Successfully!' });
        sendAttendanceNotification(empName, 'out', format(new Date(now), 'hh:mm a'));
      }
    }

    setIsProcessing(false);
    setIsProcessing(false);
    fetchAttendanceData(selectedEmpId);
  };

  const initiateAction = async (type: 'in' | 'out') => {
    if (!selectedEmpId) return;
    const isAtOffice = await verifyLocation();
    if (!isAtOffice) return;

    setActionType(type);
    if (isNative) {
       // Direct call to processAttendance which pops the native camera natively
       setTimeout(() => processAttendance(type), 0);
    } else {
       // Proceed directly for web without camera
       setTimeout(() => processAttendanceDirectly(type), 0); 
    }
  };

  const sendAttendanceNotification = async (empName: string, type: 'in' | 'out', time: string) => {
    try {
      await supabase.from('notifications').insert([
        {
          title: `Attendance Marked`,
          message: `${empName} has checked ${type} at ${time}.`,
          user_role: 'admin',
          link: '/hrms/attendance'
        },
        {
          title: `Attendance Marked`,
          message: `You have successfully checked ${type} at ${time}.`,
          user_role: 'hrms_employee',
          link: '/hrms/attendance'
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const processAttendanceDirectly = async (type: 'in' | 'out') => {
    setIsProcessing(true);
    const now = new Date().toISOString();
    const todayDate = format(new Date(), 'yyyy-MM-dd');

    if (type === 'in') {
      const empName = employees.find(e => e.id === selectedEmpId)?.name || '';
      const status = determineStatus(new Date(), empName);
      const { error } = await supabase.from('hrms_attendance').insert([{ 
        employee_id: selectedEmpId, 
        date: todayDate, 
        check_in: now, 
        status: status
      }]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Checked In Successfully!' });
        sendAttendanceNotification(empName, 'in', format(new Date(now), 'hh:mm a'));
      }
    } else {
      const empName = employees.find(e => e.id === selectedEmpId)?.name || '';
      const shift = getEmployeeShift(empName);
      const diffHrs = differenceInMinutes(new Date(), new Date(todayRecord.check_in)) / 60;
      let outStatus = todayRecord.status;
      if (diffHrs <= (shift.requiredHours / 2)) outStatus = 'Half Day';

      const { error } = await supabase.from('hrms_attendance').update({ 
        check_out: now,
        status: outStatus
      }).eq('id', todayRecord.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Checked Out Successfully!' });
        sendAttendanceNotification(empName, 'out', format(new Date(now), 'hh:mm a'));
      }
    }
    setIsProcessing(false);
    fetchAttendanceData(selectedEmpId);
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Designation,Date,Check In,Check Out,Status\n"
      + allAttendance.map(e => {
        return `${e.name},${e.designation},${attendanceDate},${e.attendance?.check_in ? format(new Date(e.attendance.check_in), 'hh:mm a') : '--'},${e.attendance?.check_out ? format(new Date(e.attendance.check_out), 'hh:mm a') : '--'},${e.attendance?.status || 'Absent'}`;
      }).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getProgressPercentage = () => {
    if (!todayRecord || !todayRecord.check_in) return 0;
    const empName = employees.find(e => e.id === selectedEmpId)?.name || '';
    const shift = getEmployeeShift(empName);
    const requiredMinutes = shift.requiredHours * 60;

    if (todayRecord.check_out) {
      const diff = differenceInMinutes(new Date(todayRecord.check_out), new Date(todayRecord.check_in));
      return Math.min((diff / requiredMinutes) * 100, 100);
    }
    const diff = differenceInMinutes(currentTime, new Date(todayRecord.check_in));
    return Math.min((diff / requiredMinutes) * 100, 100);
  };

  // Render 30 day heatmap
  const renderHeatmap = () => {
    const days = Array.from({length: 30}).map((_, i) => subDays(new Date(), 29 - i));
    return (
      <div className="mt-8">
        <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Last 30 Days (Heatmap)</h3>
        <div className="flex flex-wrap gap-2">
          {days.map((day, idx) => {
            const record = history.find(h => isSameDay(new Date(h.date), day));
            let bgColor = "bg-white/5 border-white/10"; // Absent/Off
            if (record) {
              if (record.status === 'Present') bgColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] border-emerald-400";
              else if (record.status === 'Late') bgColor = "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] border-yellow-400";
              else if (record.status === 'Half Day') bgColor = "bg-orange-500 border-orange-400";
            }
            return (
              <div key={idx} className="group relative">
                <div className={`w-6 h-6 rounded-md border ${bgColor} transition-all duration-300`}></div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 transition-opacity">
                  {format(day, 'MMM dd')} - {record ? record.status : 'N/A'}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-[10px] uppercase font-bold text-white/40">
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Present</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-500"></div> Late</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-orange-500"></div> Half Day</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-white/5"></div> Off/Absent</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
          <Activity className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white">Attendance Portal</h1>
          <p className="text-white/50 mt-1">Professional presence management with live tracking.</p>
        </div>
      </div>
      
      {isHRMSEmployee ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {renderKiosk()}
          {renderHistory()}
        </div>
      ) : (
        <Tabs defaultValue="kiosk" className="w-full space-y-6">
          <TabsList className="bg-black/40 border border-white/10 p-1">
            <TabsTrigger value="kiosk" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Mark Attendance</TabsTrigger>
            <TabsTrigger value="records" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Daily Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kiosk">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {renderKiosk()}
              {renderHistory()}
            </div>
          </TabsContent>
          
          <TabsContent value="records">
            {renderAdminRecords()}
          </TabsContent>
        </Tabs>
      )}

      {/* Webcam Modal removed, using Native Camera */}
    </div>
  );

  function renderKiosk() {
    const progress = getProgressPercentage();
    
    return (
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            
            {/* Live Digital Clock */}
            <div className="mb-8 relative z-10">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-white/50 font-medium mt-1">{format(currentTime, 'EEEE, MMMM do, yyyy')}</div>
            </div>

            <div className="space-y-6 text-left relative z-10">
              {!isHRMSEmployee && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 ml-1">Select Employee Profile</label>
                  <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                    <SelectTrigger className="w-full bg-black/40 border-white/10 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Search or select your name..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedEmpId && (
                <div className={isHRMSEmployee ? "" : "pt-4 border-t border-white/10"}>
                  {!todayRecord ? (
                    <Button 
                      onClick={() => initiateAction('in')}
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
                    >
                      <LogIn className="w-6 h-6 mr-2" /> Mark Check-In
                    </Button>
                  ) : !todayRecord.check_out ? (
                    <div className="space-y-6">
                      {/* Circular Progress */}
                      <div className="flex flex-col items-center justify-center p-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-white/10 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                            <circle className="text-emerald-500 stroke-current transition-all duration-1000 ease-in-out" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progress) / 100}></circle>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-white">{Math.round(progress)}%</span>
                            <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Shift</span>
                          </div>
                        </div>
                        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 w-full text-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 mx-auto mb-1" /> 
                          <span className="font-semibold text-sm">In at {format(new Date(todayRecord.check_in), 'hh:mm a')}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => initiateAction('out')}
                        className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all hover:scale-105"
                      >
                        <LogOut className="w-6 h-6 mr-2" /> Mark Check-Out
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center text-emerald-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-80" /> 
                      <h3 className="text-xl font-bold">Shift Completed</h3>
                      <div className="text-sm opacity-80 mt-2 mb-4 bg-black/20 p-3 rounded-lg border border-emerald-500/20">
                        <div className="flex justify-between mb-1"><span>Check In:</span> <span className="font-bold text-white">{format(new Date(todayRecord.check_in), 'hh:mm a')}</span></div>
                        <div className="flex justify-between mb-1"><span>Check Out:</span> <span className="font-bold text-white">{format(new Date(todayRecord.check_out), 'hh:mm a')}</span></div>
                        <div className="flex justify-between border-t border-emerald-500/20 pt-1 mt-1"><span>Total Hours:</span> <span className="font-black text-emerald-300">{calculateWorkingHours(todayRecord.check_in, todayRecord.check_out)}</span></div>
                      </div>
                      <Button 
                        onClick={() => setTodayRecord(null)}
                        className="w-full h-12 bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl transition-all"
                      >
                        <LogIn className="w-5 h-5 mr-2" /> Check In Again
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          </div>
        </div>
    );
  }

  function renderHistory() {
    return (
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8 backdrop-blur-md shadow-xl h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Recent Attendance History
            </h2>

            {!selectedEmpId ? (
              <div className="text-center py-20 text-white/30 border border-white/5 border-dashed rounded-2xl flex-1 flex items-center justify-center">
                Please select an employee profile to view history.
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Heatmap */}
                {renderHeatmap()}

                <div className="h-px bg-white/10 w-full my-8"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start overflow-y-auto pr-2 no-scrollbar">
                  {history.length === 0 && <div className="col-span-full text-white/40 text-center">No records found.</div>}
                  {history.map((record) => (
                    <div key={record.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:bg-white/5 hover:border-emerald-500/30 transition-all gap-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Clock className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="font-bold text-white">{format(new Date(record.date), 'MMM dd, yyyy')}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' : record.status === 'Late' ? 'bg-yellow-500/20 text-yellow-400' : record.status === 'Half Day' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-lg p-3 relative overflow-hidden">
                        <div>
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Check In</div>
                          <div className="text-emerald-400 font-medium text-sm flex items-center gap-1">
                            {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '--'}
                            {record.check_in_photo_url && <Camera className="w-3 h-3 text-emerald-400/50" />}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Check Out</div>
                          <div className="text-orange-400 font-medium text-sm flex items-center gap-1">
                            {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '--'}
                            {record.check_out_photo_url && <Camera className="w-3 h-3 text-orange-400/50" />}
                          </div>
                        </div>
                        {record.check_in && record.check_out && (
                           <div className="col-span-2 mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                              <span className="text-[10px] text-white/40 uppercase font-bold">Total Hours</span>
                              <span className="text-white font-bold text-xs">{calculateWorkingHours(record.check_in, record.check_out)}</span>
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    );
  }

  function renderAdminRecords() {
    let filteredAttendance = allAttendance;
    if (filterDept !== 'all') {
      filteredAttendance = allAttendance.filter(e => e.designation.toLowerCase().includes(filterDept.toLowerCase()));
    }

    const presentCount = filteredAttendance.filter(a => a.attendance && a.attendance.status !== 'Absent').length;
    const absentCount = filteredAttendance.length - presentCount;

    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-emerald-500" />
              Attendance Register
            </h2>
            <p className="text-white/50 text-sm mt-1">Daily overview of employee presence and tracking.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1 px-4 h-12 shadow-inner shrink-0">
              <span className="text-emerald-400 font-bold text-xl">{presentCount}</span>
              <span className="text-white/50 text-[10px] uppercase font-black tracking-widest">Present</span>
              <div className="h-6 w-px bg-white/10 mx-2"></div>
              <span className="text-red-400 font-bold text-xl">{absentCount}</span>
              <span className="text-white/50 text-[10px] uppercase font-black tracking-widest">Absent</span>
            </div>
            
            <Select value={filterDept} onValueChange={setFilterDept}>
               <SelectTrigger className="w-[140px] bg-black/40 border-white/10 text-white h-12 rounded-xl shrink-0">
                  <SelectValue placeholder="Department" />
               </SelectTrigger>
               <SelectContent className="bg-[#0f1115] border-white/10 text-white">
                  <SelectItem value="all">All Departments</SelectItem>
                  {Array.from(new Set(allAttendance.map(a => a.designation))).map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Input 
              type="date" 
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-black/40 border-white/10 text-white h-12 rounded-xl w-auto flex-1 sm:flex-none"
            />

            <Button onClick={exportCSV} variant="outline" className="h-12 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white shrink-0 rounded-xl px-6 font-bold gap-2 transition-all">
               <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredAttendance.map((emp) => (
              <div key={emp.id} className="bg-black/20 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all gap-5 group">
                <div className="flex items-center gap-4 w-full sm:w-auto relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex shrink-0 items-center justify-center border border-emerald-500/30 relative overflow-hidden group-hover:scale-105 transition-transform">
                    {emp.attendance?.check_in_photo_url ? (
                       <img src={emp.attendance.check_in_photo_url} alt="Selfie" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-xl font-black text-emerald-400">{emp.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-white text-lg leading-tight group-hover:text-emerald-400 transition-colors">{emp.name}</div>
                    <div className="text-xs text-white/50 font-medium">{emp.designation}</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto bg-black/40 sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none border border-white/5 sm:border-none mt-2 sm:mt-0">
                  <div className="text-left sm:text-right">
                     <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1 flex items-center sm:justify-end gap-1">In {emp.attendance?.check_in_photo_url && <Camera className="w-3 h-3 text-emerald-400/50" />}</div>
                     <div className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded text-center">{emp.attendance?.check_in ? format(new Date(emp.attendance.check_in), 'hh:mm a') : '--'}</div>
                  </div>
                  <div className="text-left sm:text-right">
                     <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1 flex items-center sm:justify-end gap-1">Out {emp.attendance?.check_out_photo_url && <Camera className="w-3 h-3 text-orange-400/50" />}</div>
                     <div className="text-orange-400 font-bold text-sm bg-orange-500/10 px-2 py-0.5 rounded text-center">{emp.attendance?.check_out ? format(new Date(emp.attendance.check_out), 'hh:mm a') : '--'}</div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end">
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${emp.attendance?.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : emp.attendance?.status === 'Late' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : emp.attendance?.status === 'Half Day' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {emp.attendance ? emp.attendance.status : "Absent"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredAttendance.length === 0 && (
              <div className="col-span-full p-12 text-center text-white/50 bg-black/20 rounded-2xl border border-white/5 border-dashed font-bold">
                 No employees match the criteria.
              </div>
            )}
          </div>
      </div>
    );
  }
}
