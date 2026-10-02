import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import {
  Calendar,
  Clock,
  User,
  LogOut,
  Plus,
  MessageSquare,
  History,
  X,
  Download,
  Bell,
  Settings,
  Heart,
  Activity,
  FileText,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Appointment, CreateAppointmentRequest, Message } from "@shared/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [activeTab, setActiveTab] = useState("overview");

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");


  // Mock upcoming appointments for quick overview
  const upcomingAppointments = appointments
    .filter(
      (apt) => apt.status === "pending" && new Date(apt.date) >= new Date(),
    )
    .slice(0, 3);

  const recentActivity = [
    {
      id: 1,
      action: "Appointment booked",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: 2,
      action: "Prescription downloaded",
      time: "1 day ago",
      type: "info",
    },
    {
      id: 3,
      action: "Appointment completed",
      time: "3 days ago",
      type: "success",
    },
  ];

  useEffect(() => {
    fetchAppointments();
    fetchMessages();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const response = await fetch("/api/messages/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message_id: messageId }),
      });

      if (response.ok) {
        // Update local state to mark message as read
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const appointmentData: CreateAppointmentRequest = {
        title,
        date,
        start_time: startTime,
        end_time: endTime,
        notes,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        toast.success("Appointment booked successfully!");
        setTitle("");
        setDate("");
        setStartTime("");
        setEndTime("");
        setNotes("");
        fetchAppointments();
        setActiveTab("appointments");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to book appointment");
      }
    } catch (error) {
      toast.error("Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      rescheduled: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <Badge
        className={`${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"} border`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "normal":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const filterAppointments = (status?: string) => {
    if (!status) return appointments;
    return appointments.filter((apt) => apt.status === status);
  };

  const appointmentDates = appointments.map((apt) => new Date(apt.date));

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  My Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => {
                  if (messages.filter(msg => !msg.is_read).length > 0) {
                    setActiveTab("messages");
                    toast.success("Showing your unread messages");
                  } else {
                    toast.info("No new messages");
                  }
                }}
              >
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Notifications</span>
                {messages.filter(msg => !msg.is_read).length > 0 && (
                  <Badge className="bg-blue-500 text-white px-1.5 py-0.5 text-xs">
                    {messages.filter(msg => !msg.is_read).length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => {
                  toast.info("Settings panel opening soon!");
                }}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Enhanced Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </Button>
            <Button
              variant={activeTab === "book" ? "default" : "outline"}
              onClick={() => setActiveTab("book")}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Book Appointment</span>
            </Button>
            <Button
              variant={activeTab === "appointments" ? "default" : "outline"}
              onClick={() => setActiveTab("appointments")}
              className="flex items-center space-x-2"
            >
              <CalendarDays className="h-4 w-4" />
              <span>My Appointments</span>
            </Button>
            <Button
              variant={activeTab === "calendar" ? "default" : "outline"}
              onClick={() => setActiveTab("calendar")}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "outline"}
              onClick={() => setActiveTab("messages")}
              className="flex items-center space-x-2 relative"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
              {messages.filter(msg => !msg.is_read).length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {messages.filter(msg => !msg.is_read).length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">
                          Total Appointments
                        </p>
                        <p className="text-3xl font-bold">
                          {appointments.length}
                        </p>
                      </div>
                      <CalendarDays className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Completed</p>
                        <p className="text-3xl font-bold">
                          {filterAppointments("completed").length}
                        </p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Upcoming</p>
                        <p className="text-3xl font-bold">
                          {filterAppointments("pending").length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">This Month</p>
                        <p className="text-3xl font-bold">
                          {
                            appointments.filter(
                              (apt) =>
                                new Date(apt.date).getMonth() ===
                                new Date().getMonth(),
                            ).length
                          }
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <Card className="lg:col-span-2 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Upcoming Appointments</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                          No upcoming appointments
                        </p>
                        <Button
                          onClick={() => setActiveTab("book")}
                          className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500"
                        >
                          Book Your First Appointment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {appointment.title}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span>
                                    {new Date(
                                      appointment.date,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span>{appointment.start_time}</span>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions & Recent Activity */}
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Plus className="h-5 w-5 text-green-600" />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button
                          onClick={() => setActiveTab("book")}
                          className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Book New Appointment
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start hover:bg-green-50"
                          onClick={() => {
                            // Generate a sample medical records PDF
                            const recordsData = `Patient Medical Records\n\nName: ${user.name}\nEmail: ${user.email}\nGenerated: ${new Date().toLocaleString()}\n\nAppointment History:\n${appointments.map((apt) => `- ${apt.title} (${new Date(apt.date).toLocaleDateString()}) - ${apt.status}`).join("\n")}`;

                            const blob = new Blob([recordsData], {
                              type: "text/plain",
                            });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `medical-records-${user.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);

                            toast.success(
                              "Medical records downloaded successfully!",
                            );
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Records
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start hover:bg-purple-50"
                          onClick={() => {
                            const message = prompt(
                              "Enter your message to the doctor:",
                            );
                            if (message && message.trim()) {
                              toast.success(
                                `Message sent to doctor: "${message.slice(0, 50)}${message.length > 50 ? "..." : ""}"`,
                              );
                            } else if (message !== null) {
                              toast.error("Please enter a valid message");
                            }
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact Doctor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center space-x-3"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                activity.type === "success"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-600">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "book" && (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="max-w-4xl mx-auto border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Calendar className="h-6 w-6" />
                    <span>Book New Appointment</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Schedule your next medical appointment with ease
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleBookAppointment} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="text-sm font-medium text-gray-700"
                          >
                            Schedule Purpose *
                          </Label>
                          <Input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter the purpose of your appointment"
                            required
                            className="h-12"
                          />
                        </div>



                        <div className="space-y-2">
                          <Label
                            htmlFor="date"
                            className="text-sm font-medium text-gray-700"
                          >
                            Preferred Date *
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            min={new Date().toISOString().split("T")[0]}
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="start-time"
                              className="text-sm font-medium text-gray-700"
                            >
                              Start Time *
                            </Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              required
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="end-time"
                              className="text-sm font-medium text-gray-700"
                            >
                              End Time *
                            </Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              required
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="notes"
                            className="text-sm font-medium text-gray-700"
                          >
                            Additional Notes
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Describe your symptoms, concerns, or any specific requests..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Info className="h-4 w-4" />
                        <span>
                          You'll receive a confirmation email once your
                          appointment is approved
                        </span>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Booking...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Appointment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "appointments" && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Appointments</TabsTrigger>
                  <TabsTrigger value="pending">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <div className="grid gap-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : appointments.length === 0 ? (
                      <Card className="border-0 shadow-lg">
                        <CardContent className="py-12 text-center">
                          <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Appointments Yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Start your healthcare journey by booking your first
                            appointment.
                          </p>
                          <Button
                            onClick={() => setActiveTab("book")}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Book Your First Appointment
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      appointments.map((appointment) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="group"
                        >
                          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-3 flex-1">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                      {getPriorityIcon("normal")}
                                      <h3 className="font-semibold text-lg text-gray-900">
                                        {appointment.title}
                                      </h3>
                                    </div>
                                    {getStatusBadge(appointment.status)}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="h-4 w-4 text-blue-500" />
                                      <span className="font-medium">
                                        {new Date(
                                          appointment.date,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-green-500" />
                                      <span>
                                        {appointment.start_time} -{" "}
                                        {appointment.end_time}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <FileText className="h-4 w-4 text-purple-500" />
                                      <span>ID: #{appointment.id}</span>
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                                      <p className="text-sm text-gray-700">
                                        <strong>Notes:</strong>{" "}
                                        {appointment.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col space-y-2 ml-6">
                                  {appointment.status === "completed" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        window.open(
                                          `/api/appointments/${appointment.id}/pdf`,
                                          "_blank",
                                        );
                                      }}
                                      className="flex items-center space-x-2 hover:bg-blue-50"
                                    >
                                      <Download className="h-4 w-4" />
                                      <span>Download PDF</span>
                                    </Button>
                                  )}
                                  {appointment.status === "pending" && (
                                    <div className="flex items-center space-x-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                      <Clock className="h-3 w-3" />
                                      <span>Pending</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pending">
                  <div className="grid gap-4">
                    {filterAppointments("pending").map((appointment) => (
                      <Card
                        key={appointment.id}
                        className="border-l-4 border-l-yellow-500 shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-gray-900">
                                {appointment.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>
                                  {new Date(
                                    appointment.date,
                                  ).toLocaleDateString()}
                                </span>
                                <span>
                                  {appointment.start_time} -{" "}
                                  {appointment.end_time}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="completed">
                  <div className="grid gap-4">
                    {filterAppointments("completed").map((appointment) => (
                      <Card
                        key={appointment.id}
                        className="border-l-4 border-l-green-500 shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-gray-900">
                                {appointment.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>
                                  {new Date(
                                    appointment.date,
                                  ).toLocaleDateString()}
                                </span>
                                <span>
                                  {appointment.start_time} -{" "}
                                  {appointment.end_time}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(appointment.status)}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  window.open(
                                    `/api/appointments/${appointment.id}/pdf`,
                                    "_blank",
                                  );
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="cancelled">
                  <div className="grid gap-4">
                    {filterAppointments("cancelled").map((appointment) => (
                      <Card
                        key={appointment.id}
                        className="border-l-4 border-l-red-500 shadow-lg opacity-75"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-gray-900">
                                {appointment.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>
                                  {new Date(
                                    appointment.date,
                                  ).toLocaleDateString()}
                                </span>
                                <span>
                                  {appointment.start_time} -{" "}
                                  {appointment.end_time}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {activeTab === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>Appointment Calendar</span>
                  </CardTitle>
                  <CardDescription>
                    View your appointments in calendar format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/2">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        modifiers={{
                          hasAppointment: appointmentDates,
                        }}
                        modifiersStyles={{
                          hasAppointment: {
                            backgroundColor: "#3B82F6",
                            color: "white",
                            fontWeight: "bold",
                          },
                        }}
                      />
                    </div>
                    <div className="lg:w-1/2 space-y-4">
                      <h3 className="font-semibold text-lg">
                        {selectedDate
                          ? `Appointments for ${format(selectedDate, "MMMM d, yyyy")}`
                          : "Select a date to view appointments"}
                      </h3>
                      {selectedDate && (
                        <div className="space-y-3">
                          {appointments
                            .filter(
                              (apt) =>
                                new Date(apt.date).toDateString() ===
                                selectedDate.toDateString(),
                            )
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {appointment.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {appointment.start_time} -{" "}
                                      {appointment.end_time}
                                    </p>
                                  </div>
                                  {getStatusBadge(appointment.status)}
                                </div>
                              </div>
                            ))}
                          {appointments.filter(
                            (apt) =>
                              new Date(apt.date).toDateString() ===
                              selectedDate.toDateString(),
                          ).length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                              No appointments scheduled for this date
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span>Messages</span>
                    {messages.filter(msg => !msg.is_read).length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {messages.filter(msg => !msg.is_read).length} new
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Messages from your healthcare providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Messages Yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        You'll see messages from your healthcare providers here.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <Button
                          variant="outline"
                          className="flex items-center space-x-2"
                          onClick={() => {
                            window.open("tel:+1-555-HEALTH", "_self");
                            toast.success("Calling office: +1-555-HEALTH");
                          }}
                        >
                          <Phone className="h-4 w-4" />
                          <span>Call Office</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center space-x-2"
                          onClick={() => {
                            window.open(
                              "mailto:support@medibook.com?subject=Patient Inquiry&body=Hello, I need assistance with...",
                              "_blank",
                            );
                            toast.success("Opening email client...");
                          }}
                        >
                          <Mail className="h-4 w-4" />
                          <span>Send Email</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((message) => (
                          <div
                            key={message.id}
                            className={`p-4 rounded-lg border transition-all cursor-pointer ${
                              message.is_read
                                ? "bg-gray-50 border-gray-200"
                                : "bg-blue-50 border-blue-200 shadow-sm"
                            }`}
                            onClick={() => !message.is_read && markMessageAsRead(message.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {message.is_broadcast && (
                                  <Badge variant="secondary" className="text-xs">
                                    Broadcast
                                  </Badge>
                                )}
                                {!message.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            {message.subject && (
                              <h4 className="font-semibold text-gray-900 mb-2">
                                {message.subject}
                              </h4>
                            )}
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {message.message_text}
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="text-xs text-gray-500">
                                From: Healthcare Provider
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
