import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  User,
  Calendar,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Monitor,
  ArrowLeft,
  XCircle,
  X,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface Appointment {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled" | "no-show";
  notes?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
    phone?: string;
    age?: number;
    gender?: string;
  };
}

export default function HospitalDisplay() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [processedAppointments, setProcessedAppointments] = useState<Appointment[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodaysAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter appointments for selected date (show all statuses)
        const filteredAppointments = data.filter((apt: Appointment) =>
          apt.date === selectedDate
        );
        setAppointments(filteredAppointments);
      }
    } catch (error) {
      toast.error("Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTodaysAppointments();
    }
  }, [token, selectedDate]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      rescheduled: "bg-purple-100 text-purple-800 border-purple-200",
      "no-show": "bg-orange-100 text-orange-800 border-orange-200",
    };

    return (
      <Badge
        className={`${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"} border text-sm px-3 py-1`}
      >
        {status === "no-show" ? "No Show" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTimeStatus = (startTime: string, endTime: string, appointmentStatus: string) => {
    const now = currentTime;
    const currentTimeStr = now.toTimeString().slice(0, 5);

    // If appointment is already marked as completed, show completed status
    if (appointmentStatus === "completed") {
      return { status: "completed", color: "text-blue-600", icon: CheckCircle };
    }

    // If appointment is cancelled, show cancelled status
    if (appointmentStatus === "cancelled") {
      return { status: "cancelled", color: "text-red-600", icon: AlertCircle };
    }

    // If appointment is no-show, show no-show status
    if (appointmentStatus === "no-show") {
      return { status: "no-show", color: "text-orange-600", icon: XCircle };
    }

    // Time-based status for pending/confirmed appointments
    if (currentTimeStr < startTime) {
      return { status: "upcoming", color: "text-blue-600", icon: Clock };
    } else if (currentTimeStr >= startTime && currentTimeStr <= endTime) {
      return { status: "current", color: "text-green-600", icon: CheckCircle };
    } else {
      // Past end time but not marked as completed
      return { status: "overdue", color: "text-orange-600", icon: AlertCircle };
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const sortedAppointments = appointments.sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8082/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Move appointment from active queue to processed list
        setAppointments(prev => {
          const appointmentToMove = prev.find(apt => apt.id === appointmentId);
          if (appointmentToMove) {
            // Add to processed appointments with updated status
            setProcessedAppointments(prevProcessed => [
              ...prevProcessed,
              { ...appointmentToMove, status: newStatus as any }
            ]);
          }
          // Remove from active appointments
          return prev.filter(apt => apt.id !== appointmentId);
        });

        const statusMessages = {
          completed: "Appointment marked as completed (Patient Present) - Moved to processed",
          cancelled: "Appointment cancelled - Moved to processed",
          rescheduled: "Appointment rescheduled - Moved to processed",
          "no-show": "Appointment marked as No Show - Moved to processed"
        };

        toast.success(statusMessages[newStatus as keyof typeof statusMessages] || `Appointment status updated to ${newStatus} - Moved to processed`);
      } else {
        throw new Error("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  window.location.href = '/admin';
                }
              }}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="p-3 bg-blue-600 rounded-xl">
              <Monitor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Display</h1>
              <p className="text-gray-600">Appointment Preview System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString([], { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <Button
              onClick={fetchTodaysAppointments}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="mt-6 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Badge variant="outline" className="text-sm">
            {appointments.length} appointments scheduled
          </Badge>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid gap-6">
        {sortedAppointments.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Appointments Scheduled
              </h3>
              <p className="text-gray-600">
                There are no confirmed or pending appointments for {new Date(selectedDate).toLocaleDateString()}.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedAppointments.map((appointment) => {
            const timeStatus = getTimeStatus(appointment.start_time, appointment.end_time, appointment.status);
            const TimeIcon = timeStatus.icon;
            
            return (
              <Card 
                key={appointment.id} 
                className={`border-0 shadow-lg transition-all duration-300 ${
                  timeStatus.status === 'current' 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : 'hover:shadow-xl'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        timeStatus.status === 'current' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <TimeIcon className={`h-6 w-6 ${timeStatus.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">
                          {appointment.title}
                        </CardTitle>
                        <p className={`text-sm font-medium ${timeStatus.color}`}>
                          {timeStatus.status === 'current' ? 'Currently In Session' :
                           timeStatus.status === 'upcoming' ? 'Upcoming' :
                           timeStatus.status === 'completed' ? 'Appointment Completed' :
                           timeStatus.status === 'cancelled' ? 'Cancelled' :
                           timeStatus.status === 'overdue' ? 'Overdue - Needs Update' : 'Unknown Status'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  {/* Ultra Compact Attendance Actions */}
                  {(appointment.status === "pending" || appointment.status === "confirmed") && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                          className="bg-green-500 hover:bg-green-600 text-white text-[10px] py-0.5 px-2 h-6 min-h-0 w-auto"
                          size="sm"
                        >
                          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                          Present
                        </Button>
                        <Button
                          onClick={() => updateAppointmentStatus(appointment.id, "no-show")}
                          variant="outline"
                          className="border border-orange-400 text-orange-600 hover:bg-orange-50 text-[10px] py-0.5 px-2 h-6 min-h-0 w-auto"
                          size="sm"
                        >
                          <XCircle className="h-2.5 w-2.5 mr-0.5" />
                          No Show
                        </Button>
                        <Button
                          onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                          variant="outline"
                          className="border border-red-400 text-red-600 hover:bg-red-50 text-[10px] py-0.5 px-2 h-6 min-h-0 w-auto"
                          size="sm"
                        >
                          <X className="h-2.5 w-2.5 mr-0.5" />
                          Cancel
                        </Button>
                        <Button
                          onClick={() => updateAppointmentStatus(appointment.id, "rescheduled")}
                          variant="outline"
                          className="border border-blue-400 text-blue-600 hover:bg-blue-50 text-[10px] py-0.5 px-2 h-6 min-h-0 w-auto"
                          size="sm"
                        >
                          <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Time Information */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Time Slot</p>
                        <p className="font-semibold text-gray-900">
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(appointment.date).toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Patient Information
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">
                          {appointment.user?.name || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {appointment.user?.email || 'N/A'}
                        </p>
                      </div>
                      
                      {appointment.user?.phone && (
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {appointment.user.phone}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-600">Age & Gender</p>
                        <p className="font-medium text-gray-900">
                          {appointment.user?.age ? `${appointment.user.age} years` : 'N/A'} • {appointment.user?.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Appointment Notes
                      </h4>
                      <p className="text-gray-700">{appointment.notes}</p>
                    </div>
                  )}



                  {/* Status Display for Completed Appointments */}
                  {(appointment.status === "completed" || appointment.status === "cancelled" || appointment.status === "no-show" || appointment.status === "rescheduled") && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : appointment.status === "no-show"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {appointment.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {appointment.status === "cancelled" && <X className="h-3 w-3 mr-1" />}
                        {appointment.status === "no-show" && <XCircle className="h-3 w-3 mr-1" />}
                        {appointment.status === "rescheduled" && <RotateCcw className="h-3 w-3 mr-1" />}
                        {appointment.status === "completed" ? "Present" :
                         appointment.status === "no-show" ? "No Show" :
                         appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Processed Appointments Section */}
      {processedAppointments.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-600 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Processed Appointments</h2>
                <p className="text-gray-600">{processedAppointments.length} appointments processed today</p>
              </div>
            </div>
            <Button
              onClick={() => setProcessedAppointments([])}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Clear All</span>
            </Button>
          </div>

          <div className="grid gap-4">
            {processedAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-gray-400 bg-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-700">{appointment.title}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : appointment.status === "no-show"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {appointment.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {appointment.status === "cancelled" && <X className="h-3 w-3 mr-1" />}
                      {appointment.status === "no-show" && <XCircle className="h-3 w-3 mr-1" />}
                      {appointment.status === "rescheduled" && <RotateCcw className="h-3 w-3 mr-1" />}
                      {appointment.status === "completed" ? "Present" :
                       appointment.status === "no-show" ? "No Show" :
                       appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{appointment.user?.name || `Patient ID: ${appointment.user_id}`}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    {appointment.user?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.user.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
