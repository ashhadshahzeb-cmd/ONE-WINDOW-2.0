import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Activity, Clock, LogIn, LogOut, CheckCircle2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { ScanFace } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

import { useAuth } from '@/contexts/AuthContext';

const OFFICE_LAT = 24.898287250826936;
const OFFICE_LNG = 67.07303610170393;
const ALLOWED_RADIUS_METERS = 150;

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
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

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employees on load
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

  // Fetch attendance when employee is selected (Kiosk)
  useEffect(() => {
    if (selectedEmpId) {
      fetchAttendanceData(selectedEmpId);
    } else {
      setTodayRecord(null);
      setHistory([]);
    }
  }, [selectedEmpId]);

  // Fetch all attendance for Admin Records
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
    
    // Check today's record (get the most recent one to allow multiple check-ins)
    const { data: todayData } = await supabase
      .from('hrms_attendance')
      .select('*')
      .eq('employee_id', empId)
      .eq('date', todayDate)
      .order('check_in', { ascending: false })
      .limit(1);
      
    setTodayRecord(todayData?.[0] || null);

    // Fetch history
    const { data: historyData } = await supabase
      .from('hrms_attendance')
      .select('*')
      .eq('employee_id', empId)
      .order('date', { ascending: false })
      .limit(30);
      
    setHistory(historyData || []);
  };

  const fetchAllAttendance = async (dateStr: string) => {
    // Note: We'll manually join employees and attendance to show all employees, even if absent
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
    if (!Capacitor.isNativePlatform()) {
      return true; // Ignore on web dashboard
    }
    
    try {
      const status = await Geolocation.checkPermissions();
      if (status.location !== 'granted' && status.location !== 'prompt') {
        toast({ title: 'Permission Denied', description: 'Please enable location permissions in app settings.', variant: 'destructive' });
        return false;
      }
      if (status.location === 'prompt') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
           toast({ title: 'Permission Denied', description: 'Location permission is required to mark attendance.', variant: 'destructive' });
           return false;
        }
      }
      
      toast({ title: 'Verifying Location...', description: 'Please wait while we check your location.' });
      
      const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      
      const distance = getDistanceFromLatLonInM(
         coordinates.coords.latitude, 
         coordinates.coords.longitude,
         OFFICE_LAT,
         OFFICE_LNG
      );
      
      if (distance > ALLOWED_RADIUS_METERS) {
         toast({ 
           title: 'Out of Office Range 🛑', 
           description: `You are ${Math.round(distance)} meters away from the office. You must be within ${ALLOWED_RADIUS_METERS} meters to mark attendance.`, 
           variant: 'destructive' 
         });
         return false;
      }
      
      return true;
    } catch (error: any) {
      toast({ title: 'Location Error', description: error.message || 'Could not verify your location. Please turn on GPS.', variant: 'destructive' });
      return false;
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEmpId) return;

    const isAtOffice = await verifyLocation();
    if (!isAtOffice) return;

    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const now = new Date().toISOString();

    const { error } = await supabase.from('hrms_attendance').insert([
      { employee_id: selectedEmpId, date: todayDate, check_in: now, status: 'Present' }
    ]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Checked In Successfully!' });
      fetchAttendanceData(selectedEmpId);
    }
  };



  const handleCheckOut = async () => {
    if (!selectedEmpId || !todayRecord) return;

    const isAtOffice = await verifyLocation();
    if (!isAtOffice) return;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('hrms_attendance')
      .update({ check_out: now })
      .eq('id', todayRecord.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Checked Out Successfully!' });
      fetchAttendanceData(selectedEmpId);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
          <Activity className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white">Attendance Portal</h1>
          <p className="text-white/50 mt-1">Manage daily presence and track history.</p>
        </div>
      </div>
      
      {isHRMSEmployee ? (
        // Employee Only View (No Tabs)
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {renderKiosk()}
          {renderHistory()}
        </div>
      ) : (
        // Admin View (With Tabs)
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
    </div>
  );

  function renderKiosk() {
    return (
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            
            {/* Live Digital Clock */}
            <div className="mb-8">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-white/50 font-medium mt-1">{format(currentTime, 'EEEE, MMMM do, yyyy')}</div>
            </div>

            <div className="space-y-6 text-left">
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
                      onClick={handleCheckIn}
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
                    >
                      <LogIn className="w-6 h-6 mr-2" /> Mark Check-In
                    </Button>
                  ) : !todayRecord.check_out ? (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" /> 
                        <span className="font-semibold">Checked in at {format(new Date(todayRecord.check_in), 'hh:mm a')}</span>
                      </div>
                      <Button 
                        onClick={handleCheckOut}
                        className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all hover:scale-105"
                      >
                        <LogOut className="w-6 h-6 mr-2" /> Mark Check-Out
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center text-emerald-400">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-80" /> 
                      <h3 className="text-xl font-bold">Shift Completed</h3>
                      <p className="text-sm opacity-80 mt-1 mb-4">
                        In: {format(new Date(todayRecord.check_in), 'hh:mm a')} <br/>
                        Out: {format(new Date(todayRecord.check_out), 'hh:mm a')}
                      </p>
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
          </div>
        </div>
    );
  }

  function renderHistory() {
    return (
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8 backdrop-blur-md shadow-xl h-full">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              Recent Attendance History
            </h2>

            {!selectedEmpId ? (
              <div className="text-center py-20 text-white/30 border border-white/5 border-dashed rounded-2xl">
                Please select an employee profile to view history.
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 text-white/30 border border-white/5 border-dashed rounded-2xl">
                No attendance records found for this employee.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((record) => (
                    <div key={record.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:bg-white/5 hover:border-emerald-500/30 transition-all gap-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Clock className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="font-bold text-white">{format(new Date(record.date), 'MMM dd, yyyy')}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-lg p-3">
                        <div>
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Check In</div>
                          <div className="text-emerald-400 font-medium text-sm">{record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '--'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Check Out</div>
                          <div className="text-orange-400 font-medium text-sm">{record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '--'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </div>
        </div>
    );
  }

  function renderAdminRecords() {
    const presentCount = allAttendance.filter(a => a.attendance?.status === 'Present').length;
    const absentCount = allAttendance.length - presentCount;

    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Company Attendance Register
            </h2>
            <p className="text-white/50 text-sm mt-1">View and manage daily attendance for all employees.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1 px-3">
              <span className="text-emerald-400 font-bold text-lg">{presentCount}</span>
              <span className="text-white/50 text-sm uppercase tracking-wider">Present</span>
              <div className="h-6 w-px bg-white/10 mx-2"></div>
              <span className="text-red-400 font-bold text-lg">{absentCount}</span>
              <span className="text-white/50 text-sm uppercase tracking-wider">Absent</span>
            </div>
            
            <Input 
              type="date" 
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-black/40 border-white/10 text-white h-12 rounded-xl w-auto flex-1 sm:flex-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {allAttendance.map((emp) => (
              <div key={emp.id} className="bg-black/20 border border-white/5 hover:border-emerald-500/30 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex shrink-0 items-center justify-center border border-emerald-500/30">
                    <span className="text-lg font-black text-emerald-400">{emp.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-lg leading-tight">{emp.name}</div>
                    <div className="text-xs text-white/50">{emp.designation}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto bg-black/40 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                  <div className="text-left sm:text-right">
                     <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Check In</div>
                     <div className="text-emerald-400 font-medium text-sm">{emp.attendance?.check_in ? format(new Date(emp.attendance.check_in), 'hh:mm a') : '--'}</div>
                  </div>
                  <div className="text-left sm:text-right">
                     <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">Check Out</div>
                     <div className="text-orange-400 font-medium text-sm">{emp.attendance?.check_out ? format(new Date(emp.attendance.check_out), 'hh:mm a') : '--'}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.attendance ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {emp.attendance ? "Present" : "Absent"}
                  </span>
                </div>
              </div>
            ))}
            {allAttendance.length === 0 && (
              <div className="col-span-full p-8 text-center text-white/50 bg-black/20 rounded-xl border border-white/5 border-dashed">
                 No employees found.
              </div>
            )}
          </div>
      </div>
    );
  }
}
