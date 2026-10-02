import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  Clock,
  LogOut,
  BarChart3,
  CheckCircle,
  XCircle,
  RotateCcw,
  Filter,
  Search,
  Download,
  Bell,
  Settings,
  TrendingUp,
  Activity,
  UserPlus,
  CalendarDays,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Monitor,
  User as UserIcon,
  FileText,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import {
  Appointment,
  DashboardStats,
  User,
  UserWithCredentials,
} from "@shared/api";
import CreateUserModal from "@/components/CreateUserModal";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
// Charts will be implemented later
const BarChart = ({ children, ...props }: any) => <div className="h-64 bg-gray-100 rounded flex items-center justify-center">Chart Placeholder</div>;
const Bar = (props: any) => null;
const XAxis = (props: any) => null;
const YAxis = (props: any) => null;
const CartesianGrid = (props: any) => null;
const Tooltip = (props: any) => null;
const ResponsiveContainer = ({ children, ...props }: any) => <div className="w-full h-full">{children}</div>;
const LineChart = ({ children, ...props }: any) => <div className="h-64 bg-gray-100 rounded flex items-center justify-center">Chart Placeholder</div>;
const Line = (props: any) => null;
const PieChart = ({ children, ...props }: any) => <div className="h-64 bg-gray-100 rounded flex items-center justify-center">Chart Placeholder</div>;
const Pie = (props: any) => null;
const Cell = (props: any) => null;
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserWithCredentials[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    newUsersThisMonth: 0,
    appointmentsThisMonth: 0,
    revenue: 0,
    revenueGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedView, setSelectedView] = useState("overview");
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [messageType, setMessageType] = useState<"all" | "individual">("all");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showEditAppointment, setShowEditAppointment] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
    notes: "",
    status: "pending"
  });
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithCredentials | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserFormData, setEditUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient" as "patient" | "admin",
    phone: "",
    age: undefined as number | undefined,
    gender: undefined as "male" | "female" | "other" | undefined
  });
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsData, setSettingsData] = useState({
    hospitalName: "MediBook Hospital",
    hospitalAddress: "123 Medical Center Dr, Healthcare City, HC 12345",
    hospitalPhone: "+1 (555) 123-4567",
    hospitalEmail: "info@medibook.com",
    businessHours: {
      monday: { open: "08:00", close: "18:00", closed: false },
      tuesday: { open: "08:00", close: "18:00", closed: false },
      wednesday: { open: "08:00", close: "18:00", closed: false },
      thursday: { open: "08:00", close: "18:00", closed: false },
      friday: { open: "08:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "16:00", closed: false },
      sunday: { open: "09:00", close: "16:00", closed: true }
    },
    appointmentSettings: {
      maxAppointmentsPerDay: 50,
      appointmentDuration: 30,
      advanceBookingDays: 30,
      reminderHours: 24,
      allowRescheduling: true,
      allowCancellation: true
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      statusUpdates: true,
      marketingEmails: false
    },
    systemSettings: {
      autoBackup: true,
      backupFrequency: "daily",
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      maintenanceMode: false
    }
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread" | "admin" | "user">("all");
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    adminNotifications: true,
    userNotifications: true,
    appointmentReminders: true,
    systemAlerts: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00"
    }
  });

  // Notification utility functions
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Send to server (for real implementation)
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to mark notification as read on server');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast.success("All notifications marked as read!");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    toast.success("Notification deleted");
  };

  const getUnreadCount = () => notifications.filter(notif => !notif.read).length;

  const getFilteredNotifications = () => {
    switch (notificationFilter) {
      case "unread":
        return notifications.filter(notif => !notif.read);
      case "admin":
        return notifications.filter(notif => notif.type === "admin");
      case "user":
        return notifications.filter(notif => notif.type === "user");
      default:
        return notifications;
    }
  };



  const getTypeIcon = (type: string) => {
    switch (type) {
      case "admin": return <Settings className="h-4 w-4" />;
      case "user": return <UserIcon className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "admin": return "text-purple-600 bg-purple-50 border-purple-200";
      case "user": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  // Dynamic notification system
  const createNotification = (type: "admin" | "user", title: string, message: string, action: "review" | "info" | "view" = "info") => {
    const newNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      action
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for new notification
    toast.success(`New ${type} notification: ${title}`);
  };

  // Notification triggers for IMPORTANT events only
  const triggerUserCreatedNotification = (userName: string, userRole: string) => {
    createNotification(
      "user",
      "New User Registration",
      `${userName} has registered as a ${userRole}`,
      "view"
    );
  };

  const triggerUserDeletedNotification = (userName: string) => {
    createNotification(
      "admin",
      "User Deleted",
      `${userName} has been removed from the system`,
      "review"
    );
  };

  const triggerNewAppointmentNotification = (appointmentTitle: string, patientName: string) => {
    createNotification(
      "admin",
      "New Appointment Booked",
      `"${appointmentTitle}" appointment booked by ${patientName}`,
      "review"
    );
  };

  const triggerAppointmentCancelledNotification = (appointmentTitle: string, patientName: string) => {
    createNotification(
      "admin",
      "Appointment Cancelled",
      `"${appointmentTitle}" appointment cancelled by ${patientName}`,
      "review"
    );
  };

  const triggerAppointmentRescheduledNotification = (appointmentTitle: string, patientName: string) => {
    createNotification(
      "admin",
      "Appointment Rescheduled",
      `"${appointmentTitle}" appointment rescheduled by ${patientName}`,
      "review"
    );
  };

  const triggerCriticalSettingsChangedNotification = (settingName: string) => {
    createNotification(
      "admin",
      "Critical System Change",
      `${settingName} has been modified - requires attention`,
      "review"
    );
  };

  const triggerEmergencyNotification = (message: string) => {
    createNotification(
      "admin",
      "Emergency Alert",
      message,
      "review"
    );
  };

  // Function to handle new appointment creation (called from appointment booking)
  const handleNewAppointmentCreated = (appointmentData: any) => {
    triggerNewAppointmentNotification(
      appointmentData.title,
      appointmentData.patientName || `Patient ID: ${appointmentData.user_id}`
    );
  };

  // Function to handle emergency situations
  const handleEmergencyAlert = (emergencyType: string, details: string) => {
    triggerEmergencyNotification(`${emergencyType}: ${details}`);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send this to your backend
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(settingsData),
      // });

      // Only trigger notification for critical settings changes
      triggerCriticalSettingsChangedNotification("Hospital configuration");
      
      toast.success("Settings saved successfully!");
      setShowSettings(false);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Mock data for charts
  const appointmentTrends = [
    { month: "Jan", appointments: 45, completed: 40 },
    { month: "Feb", appointments: 52, completed: 48 },
    { month: "Mar", appointments: 61, completed: 55 },
    { month: "Apr", appointments: 58, completed: 52 },
    { month: "May", appointments: 67, completed: 60 },
    { month: "Jun", appointments: 71, completed: 65 },
  ];

  const statusDistribution = [
    { name: "Completed", value: stats.completedAppointments, color: "#10B981" },
    { name: "Pending", value: stats.pendingAppointments, color: "#F59E0B" },
    { name: "Cancelled", value: stats.cancelledAppointments, color: "#EF4444" },
  ];

  useEffect(() => {
    fetchAppointments();
    fetchStats();
    fetchUsers();
    fetchNotifications();
  }, [statusFilter]);

  // Auto-refresh stats and notifications every 30 seconds to show real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      fetchNotifications();
      if (selectedView === "users") {
        fetchUsers();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedView]);

  const fetchAppointments = async () => {
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await fetch(`/api/appointments${params}`, {
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

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Add password field for display purposes (server returns users without password_hash)
        const usersWithPasswords = data.map((user: any) => ({
          ...user,
          password: user.id === "1" ? "admin123" : "password123", // Mock passwords for display
        }));
        setUsers(usersWithPasswords);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Fetch notifications from server (for real implementation)
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Find the user to check if they're an admin
    const userToDelete = users.find(u => u.id === userId);

    if (userToDelete?.role === "admin") {
      toast.error("Cannot delete admin users");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const deletedUser = users.find(u => u.id === userId);
          const updatedUsers = users.filter(u => u.id !== userId);
          setUsers(updatedUsers);
          
          // Trigger notification for user deletion
          if (deletedUser) {
            triggerUserDeletedNotification(deletedUser.name);
          }
          
          toast.success("User deleted successfully");
          fetchStats();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to delete user");
        }
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleClearAllUsers = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL users except the main admin? This action cannot be undone!",
      )
    ) {
      try {
        const response = await fetch("/api/admin/users", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(`All users cleared! ${result.message}`);
          fetchUsers();
          fetchStats();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to clear users");
        }
      } catch (error) {
        toast.error("Failed to clear users");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast.error("Please fill in both subject and message content");
      return;
    }

    if (messageType === "individual" && !selectedPatient) {
      toast.error("Please select a patient to send individual message");
      return;
    }

    setIsSendingMessage(true);

    try {
      const requestBody = {
        subject: messageSubject,
        message_text: messageContent,
        is_broadcast: messageType === "all",
        ...(messageType === "individual" && { receiver_id: parseInt(selectedPatient) })
      };

      const response = await fetch("/api/messages/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const result = await response.json();

      if (messageType === "all") {
        toast.success(
          `Message "${messageSubject}" sent to all patients successfully!`,
        );
      } else {
        const patientName =
          users.find((u) => u.id.toString() === selectedPatient)?.name ||
          "Selected Patient";
        toast.success(
          `Message "${messageSubject}" sent to ${patientName} successfully!`,
        );
      }

      // Reset form
      setMessageSubject("");
      setMessageContent("");
      setSelectedPatient("");
      setMessageType("all");
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Get list of patients (excluding admins) for dropdown
  const patientUsers = users.filter((user) => user.role === "patient");

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: string,
  ) => {
    try {
      const response = await fetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        // Find the appointment to get patient info
        const appointment = appointments.find(a => a.id === appointmentId);
        if (appointment) {
          const patientName = appointment.user?.name || `Patient ID: ${appointment.user_id}`;
          
          // Only trigger notifications for important status changes
          if (newStatus === "cancelled") {
            triggerAppointmentCancelledNotification(appointment.title, patientName);
          } else if (newStatus === "rescheduled") {
            triggerAppointmentRescheduledNotification(appointment.title, patientName);
          }
        }
        
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointments();
        fetchStats();
      } else {
        toast.error("Failed to update appointment");
      }
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditFormData({
      title: appointment.title,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      notes: appointment.notes || "",
      status: appointment.status
    });
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(false);
    setShowEditAppointment(true);
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setEditFormData({
      title: appointment.title,
      date: appointment.date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      notes: appointment.notes || "",
      status: appointment.status
    });
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(false);
    setShowEditAppointment(true);
  };

  const sendReminder = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send reminder");
      }
    } catch (error) {
      toast.error("Failed to send reminder");
    }
  };

  const handleSaveAppointment = async () => {
    if (!selectedAppointment) return;

    // Validate required fields
    if (!editFormData.title.trim()) {
      toast.error("Please enter an appointment title");
      return;
    }
    if (!editFormData.date) {
      toast.error("Please select a date");
      return;
    }
    if (!editFormData.start_time) {
      toast.error("Please select a start time");
      return;
    }
    if (!editFormData.end_time) {
      toast.error("Please select an end time");
      return;
    }

    // Validate time logic
    if (editFormData.start_time >= editFormData.end_time) {
      toast.error("End time must be after start time");
      return;
    }

    setIsSavingAppointment(true);

    try {
      // Check if this is a reschedule (date or time changed)
      const isReschedule =
        editFormData.date !== selectedAppointment.date ||
        editFormData.start_time !== selectedAppointment.start_time ||
        editFormData.end_time !== selectedAppointment.end_time;

      let response;

      if (isReschedule) {
        // Use reschedule endpoint
        response = await fetch(`/api/appointments/${selectedAppointment.id}/reschedule`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: editFormData.date,
            start_time: editFormData.start_time,
            end_time: editFormData.end_time,
            notes: editFormData.notes,
          }),
        });
      } else {
        // Use regular update endpoint
        response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        toast.success(isReschedule ? "Appointment rescheduled successfully!" : "Appointment updated successfully!");
        setShowEditAppointment(false);
        fetchAppointments();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update appointment");
      }
    } catch (error) {
      toast.error("Failed to update appointment");
    } finally {
      setIsSavingAppointment(false);
    }
  };

  const handleEditUser = (user: UserWithCredentials) => {
    setEditUserFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as "patient" | "admin",
      phone: user.phone || "",
      age: user.age,
      gender: user.gender as "male" | "female" | "other" | undefined
    });
    setSelectedUser(user);
    setShowUserDetails(false);
    setEditingUserId(user.id);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    // Validate required fields
    if (!editUserFormData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!editUserFormData.email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!editUserFormData.password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserFormData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password length
    if (editUserFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSavingUser(true);

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editUserFormData.name,
          email: editUserFormData.email,
          password: editUserFormData.password,
          role: editUserFormData.role,
          phone: editUserFormData.phone,
          age: editUserFormData.age,
          gender: editUserFormData.gender,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        const updatedUsers = users.map(user => {
          if (user.id === selectedUser.id) {
            return {
              ...updatedUser,
              password: editUserFormData.password, // Keep password for display
            };
          }
          return user;
        });

        setUsers(updatedUsers);

        // If the admin is editing their own profile, update the auth context
        if (selectedUser.id === user?.id) {
          localStorage.setItem("user", JSON.stringify({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
          }));
        }

        // Only trigger notification for important changes (role change)
        if (editUserFormData.role !== selectedUser.role) {
          createNotification(
            "admin",
            "User Role Changed",
            `${selectedUser.name}'s role changed from ${selectedUser.role} to ${editUserFormData.role}`,
            "review"
          );
        }

        toast.success("User updated successfully!");
        setShowEditUser(false);
        setEditingUserId(null);
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setIsSavingUser(false);
    }
  };

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
        className={`${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"} border`}
      >
        {status === "no-show" ? "No Show" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.user_id.toString().includes(searchTerm),
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Appointment Details Modal Component
  const AppointmentDetailsModal = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAppointmentDetails(false)}
                className="rounded-full p-2"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Appointment Info */}
            <div className="space-y-6">
              {/* Title and Status */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedAppointment.title}
                </h3>
                {getStatusBadge(selectedAppointment.status)}
              </div>

              {/* Patient Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Patient Information</p>
                    <p className="font-semibold text-gray-900">
                      {selectedAppointment.user?.name || `Patient ID: ${selectedAppointment.user_id}`}
                    </p>
                    {selectedAppointment.user?.email && (
                      <p className="text-sm text-gray-600">{selectedAppointment.user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Time</p>
                      <p className="font-semibold text-gray-900">
                        {selectedAppointment.start_time} - {selectedAppointment.end_time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-amber-600 uppercase tracking-wide font-medium mb-2">Notes</p>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                {selectedAppointment.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, "confirmed");
                        setShowAppointmentDetails(false);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, "completed");
                        setShowAppointmentDetails(false);
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRescheduleAppointment(selectedAppointment)}
                      className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, "cancelled");
                        setShowAppointmentDetails(false);
                      }}
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}

                {selectedAppointment.status === "confirmed" && (
                  <>
                    <Button
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, "completed");
                        setShowAppointmentDetails(false);
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRescheduleAppointment(selectedAppointment)}
                      className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, "cancelled");
                        setShowAppointmentDetails(false);
                      }}
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => sendReminder(selectedAppointment.id)}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEditAppointment(selectedAppointment)}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Appointment Modal Component
  const EditAppointmentModal = () => {
    if (!selectedAppointment) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Appointment</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditAppointment(false)}
                className="rounded-full p-2"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Edit Form */}
            <div className="space-y-6">
              {/* Patient Information (Read-only) */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Patient</p>
                    <p className="font-semibold text-gray-900">
                      {selectedAppointment.user?.name || `Patient ID: ${selectedAppointment.user_id}`}
                    </p>
                    {selectedAppointment.user?.email && (
                      <p className="text-sm text-gray-600">{selectedAppointment.user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Purpose */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Schedule Purpose <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="mt-1"
                  placeholder="Enter the purpose of the appointment"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start_time" className="text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={editFormData.start_time}
                    onChange={(e) => setEditFormData({ ...editFormData, start_time: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time" className="text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={editFormData.end_time}
                    onChange={(e) => setEditFormData({ ...editFormData, end_time: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="mt-1"
                  rows={4}
                  placeholder="Enter appointment notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setShowEditAppointment(false)}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAppointment}
                  disabled={isSavingAppointment}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingAppointment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Details Modal Component
  const UserDetailsModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden cursor-default">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">User Details</h2>
                  <p className="text-xs text-gray-600">{selectedUser.name}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserDetails(false)}
                className="rounded-full p-1"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* User Information */}
            <div className="space-y-2 cursor-default">
              {/* Name */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Full Name</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedUser.name}</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-green-100 rounded">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Email Address</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-amber-100 rounded">
                      <Eye className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 uppercase tracking-wide font-medium">Password</p>
                      <p className="font-semibold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        {selectedUser.password}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedUser.password);
                      toast.success("Password copied to clipboard!");
                    }}
                    className="ml-2 text-amber-600 border-amber-300 hover:bg-amber-50 p-1"
                    title="Copy password"
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Phone */}
              {selectedUser.phone && (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-teal-100 rounded">
                      <MessageSquare className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">Phone Number</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedUser.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Age and Gender - Vertical Stack */}
              {selectedUser.age && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-orange-100 rounded">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Age</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedUser.age} years old</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.gender && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-3 border border-pink-100">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-pink-100 rounded">
                      <UserIcon className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-xs text-pink-600 uppercase tracking-wide font-medium">Gender</p>
                      <p className="font-semibold text-gray-900 capitalize text-sm">{selectedUser.gender}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">User Role</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900 capitalize text-sm">{selectedUser.role}</p>
                      <Badge
                        className={`text-xs ${
                          selectedUser.role === "admin"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {selectedUser.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-gray-100 rounded">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Joined Date</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-2 pt-2 mt-2">
              <Button
                variant="outline"
                onClick={() => handleEditUser(selectedUser)}
                className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 text-sm px-3 py-1"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit User
              </Button>
              <Button
                onClick={() => setShowUserDetails(false)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-4 py-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Notification Preferences Modal Component
  const NotificationPreferencesModal = () => {
    if (!showNotificationPreferences) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-600">Configure how you receive notifications</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotificationPreferences(false)}
                className="rounded-full p-2"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Preferences Form */}
            <div className="space-y-6">
              {/* General Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={notificationPreferences.emailNotifications}
                      onChange={(e) => setNotificationPreferences({
                        ...notificationPreferences,
                        emailNotifications: e.target.checked
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={notificationPreferences.smsNotifications}
                      onChange={(e) => setNotificationPreferences({
                        ...notificationPreferences,
                        smsNotifications: e.target.checked
                      })}
                      className="rounded"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="adminNotifications" className="font-medium">Admin Notifications</Label>
                      <p className="text-sm text-gray-600">System and administrative alerts</p>
                    </div>
                    <input
                      type="checkbox"
                      id="adminNotifications"
                      checked={notificationPreferences.adminNotifications}
                      onChange={(e) => setNotificationPreferences({
                        ...notificationPreferences,
                        adminNotifications: e.target.checked
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="userNotifications" className="font-medium">User Notifications</Label>
                      <p className="text-sm text-gray-600">User registration and profile updates</p>
                    </div>
                    <input
                      type="checkbox"
                      id="userNotifications"
                      checked={notificationPreferences.userNotifications}
                      onChange={(e) => setNotificationPreferences({
                        ...notificationPreferences,
                        userNotifications: e.target.checked
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="appointmentReminders" className="font-medium">Appointment Reminders</Label>
                      <p className="text-sm text-gray-600">Reminders for scheduled appointments</p>
                    </div>
                    <input
                      type="checkbox"
                      id="appointmentReminders"
                      checked={notificationPreferences.appointmentReminders}
                      onChange={(e) => setNotificationPreferences({
                        ...notificationPreferences,
                        appointmentReminders: e.target.checked
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="systemAlerts" className="font-medium">System Alerts</Label>
                      <p className="text-sm text-gray-600">Important system status updates</p>
                    </div>
                    <input
                      type="checkbox"
                      id="systemAlerts"
                      checked={notificationPreferences.systemAlerts}
                      onChange={(e) => setNotificationPreferences({
                        ...notificationPreferences,
                        systemAlerts: e.target.checked
                      })}
                      className="rounded"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quiet Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quiet Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label htmlFor="quietHoursEnabled" className="font-medium">Enable Quiet Hours</Label>
                      <p className="text-sm text-gray-600">Reduce notifications during specific hours</p>
                    </div>
                    <input
                      type="checkbox"
                      id="quietHoursEnabled"
                      checked={notificationPreferences.quietHours.enabled}
                      onChange={(e) => setNotificationPreferences({
                        ...notificationPreferences,
                        quietHours: {
                          ...notificationPreferences.quietHours,
                          enabled: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  {notificationPreferences.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quietStart">Start Time</Label>
                        <Input
                          id="quietStart"
                          type="time"
                          value={notificationPreferences.quietHours.start}
                          onChange={(e) => setNotificationPreferences({
                            ...notificationPreferences,
                            quietHours: {
                              ...notificationPreferences.quietHours,
                              start: e.target.value
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quietEnd">End Time</Label>
                        <Input
                          id="quietEnd"
                          type="time"
                          value={notificationPreferences.quietHours.end}
                          onChange={(e) => setNotificationPreferences({
                            ...notificationPreferences,
                            quietHours: {
                              ...notificationPreferences.quietHours,
                              end: e.target.value
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNotificationPreferences(false)}
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Notification preferences saved!");
                  setShowNotificationPreferences(false);
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Notifications Modal Component
  const NotificationsModal = () => {
    if (!showNotifications) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-600">
                    {getUnreadCount()} unread notifications
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllNotificationsAsRead}
                  disabled={isMarkingAllRead || getUnreadCount() === 0}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  {isMarkingAllRead ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark All Read
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="rounded-full p-2"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={notificationFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotificationFilter("all")}
                  className="text-sm"
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={notificationFilter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotificationFilter("unread")}
                  className="text-sm"
                >
                  Unread ({getUnreadCount()})
                </Button>
                <Button
                  variant={notificationFilter === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotificationFilter("admin")}
                  className="text-sm"
                >
                  Admin ({notifications.filter(n => n.type === "admin").length})
                </Button>
                <Button
                  variant={notificationFilter === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotificationFilter("user")}
                  className="text-sm"
                >
                  Users ({notifications.filter(n => n.type === "user").length})
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {getFilteredNotifications().length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600">
                    {notificationFilter === "all" 
                      ? "You're all caught up!" 
                      : `No ${notificationFilter} notifications found.`
                    }
                  </p>
                </div>
              ) : (
                getFilteredNotifications().map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-xl transition-all duration-200 hover:shadow-md ${
                      notification.read 
                        ? "bg-gray-50 border-gray-200" 
                        : "bg-white border-blue-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Notification Icon */}
                      <div className={`p-2 rounded-lg border ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1">
                              <h3 className={`font-semibold text-sm ${
                                notification.read ? "text-gray-700" : "text-gray-900"
                              }`}>
                                {notification.title}
                              </h3>
                            </div>
                            <p className={`text-sm ${
                              notification.read ? "text-gray-600" : "text-gray-700"
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <span className="text-xs text-blue-600 font-medium">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-blue-600 hover:bg-blue-50 p-1"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:bg-red-50 p-1"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            {getFilteredNotifications().length > 0 && (
              <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
                <div className="text-sm text-gray-600">
                  Showing {getFilteredNotifications().length} of {notifications.length} notifications
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNotifications(false);
                      setShowNotificationPreferences(true);
                    }}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear all notifications?")) {
                        setNotifications([]);
                        toast.success("All notifications cleared!");
                      }
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Settings Modal Component
  const SettingsModal = () => {
    if (!showSettings) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                  <p className="text-sm text-gray-600">Configure hospital and system preferences</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="rounded-full p-2"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="hospital" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="hospital">Hospital Info</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              {/* Hospital Information Tab */}
              <TabsContent value="hospital" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <span>Hospital Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hospitalName">Hospital Name</Label>
                        <Input
                          id="hospitalName"
                          value={settingsData.hospitalName}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            hospitalName: e.target.value
                          })}
                          placeholder="Enter hospital name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hospitalPhone">Phone Number</Label>
                        <Input
                          id="hospitalPhone"
                          value={settingsData.hospitalPhone}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            hospitalPhone: e.target.value
                          })}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="hospitalEmail">Email Address</Label>
                      <Input
                        id="hospitalEmail"
                        type="email"
                        value={settingsData.hospitalEmail}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          hospitalEmail: e.target.value
                        })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hospitalAddress">Address</Label>
                      <Textarea
                        id="hospitalAddress"
                        value={settingsData.hospitalAddress}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          hospitalAddress: e.target.value
                        })}
                        placeholder="Enter hospital address"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span>Business Hours</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(settingsData.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="w-24">
                            <Label className="capitalize font-medium">{day}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`closed-${day}`}
                              checked={hours.closed}
                              onChange={(e) => setSettingsData({
                                ...settingsData,
                                businessHours: {
                                  ...settingsData.businessHours,
                                  [day]: { ...hours, closed: e.target.checked }
                                }
                              })}
                              className="rounded"
                            />
                            <Label htmlFor={`closed-${day}`} className="text-sm">Closed</Label>
                          </div>
                          {!hours.closed && (
                            <>
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) => setSettingsData({
                                  ...settingsData,
                                  businessHours: {
                                    ...settingsData.businessHours,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                })}
                                className="w-32"
                              />
                              <span className="text-gray-500">to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) => setSettingsData({
                                  ...settingsData,
                                  businessHours: {
                                    ...settingsData.businessHours,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                })}
                                className="w-32"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span>Appointment Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxAppointments">Max Appointments Per Day</Label>
                        <Input
                          id="maxAppointments"
                          type="number"
                          min="1"
                          max="100"
                          value={settingsData.appointmentSettings.maxAppointmentsPerDay}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            appointmentSettings: {
                              ...settingsData.appointmentSettings,
                              maxAppointmentsPerDay: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="appointmentDuration">Appointment Duration (minutes)</Label>
                        <Select
                          value={settingsData.appointmentSettings.appointmentDuration.toString()}
                          onValueChange={(value) => setSettingsData({
                            ...settingsData,
                            appointmentSettings: {
                              ...settingsData.appointmentSettings,
                              appointmentDuration: parseInt(value)
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="advanceBooking">Advance Booking Days</Label>
                        <Input
                          id="advanceBooking"
                          type="number"
                          min="1"
                          max="365"
                          value={settingsData.appointmentSettings.advanceBookingDays}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            appointmentSettings: {
                              ...settingsData.appointmentSettings,
                              advanceBookingDays: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reminderHours">Reminder Hours Before</Label>
                        <Input
                          id="reminderHours"
                          type="number"
                          min="1"
                          max="72"
                          value={settingsData.appointmentSettings.reminderHours}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            appointmentSettings: {
                              ...settingsData.appointmentSettings,
                              reminderHours: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="allowRescheduling"
                          checked={settingsData.appointmentSettings.allowRescheduling}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            appointmentSettings: {
                              ...settingsData.appointmentSettings,
                              allowRescheduling: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                        <Label htmlFor="allowRescheduling">Allow Rescheduling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="allowCancellation"
                          checked={settingsData.appointmentSettings.allowCancellation}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            appointmentSettings: {
                              ...settingsData.appointmentSettings,
                              allowCancellation: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                        <Label htmlFor="allowCancellation">Allow Cancellation</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-orange-600" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                          <p className="text-sm text-gray-600">Send notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={settingsData.notificationSettings.emailNotifications}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            notificationSettings: {
                              ...settingsData.notificationSettings,
                              emailNotifications: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                          <p className="text-sm text-gray-600">Send notifications via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          id="smsNotifications"
                          checked={settingsData.notificationSettings.smsNotifications}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            notificationSettings: {
                              ...settingsData.notificationSettings,
                              smsNotifications: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="appointmentReminders" className="font-medium">Appointment Reminders</Label>
                          <p className="text-sm text-gray-600">Send appointment reminders to patients</p>
                        </div>
                        <input
                          type="checkbox"
                          id="appointmentReminders"
                          checked={settingsData.notificationSettings.appointmentReminders}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            notificationSettings: {
                              ...settingsData.notificationSettings,
                              appointmentReminders: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="statusUpdates" className="font-medium">Status Updates</Label>
                          <p className="text-sm text-gray-600">Notify patients of appointment status changes</p>
                        </div>
                        <input
                          type="checkbox"
                          id="statusUpdates"
                          checked={settingsData.notificationSettings.statusUpdates}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            notificationSettings: {
                              ...settingsData.notificationSettings,
                              statusUpdates: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Tab */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor className="h-5 w-5 text-gray-600" />
                      <span>System Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          min="5"
                          max="480"
                          value={settingsData.systemSettings.sessionTimeout}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            systemSettings: {
                              ...settingsData.systemSettings,
                              sessionTimeout: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          min="3"
                          max="10"
                          value={settingsData.systemSettings.maxLoginAttempts}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            systemSettings: {
                              ...settingsData.systemSettings,
                              maxLoginAttempts: parseInt(e.target.value)
                            }
                          })}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="autoBackup" className="font-medium">Auto Backup</Label>
                          <p className="text-sm text-gray-600">Automatically backup system data</p>
                        </div>
                        <input
                          type="checkbox"
                          id="autoBackup"
                          checked={settingsData.systemSettings.autoBackup}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            systemSettings: {
                              ...settingsData.systemSettings,
                              autoBackup: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label htmlFor="maintenanceMode" className="font-medium">Maintenance Mode</Label>
                          <p className="text-sm text-gray-600">Enable maintenance mode (restricts access)</p>
                        </div>
                        <input
                          type="checkbox"
                          id="maintenanceMode"
                          checked={settingsData.systemSettings.maintenanceMode}
                          onChange={(e) => setSettingsData({
                            ...settingsData,
                            systemSettings: {
                              ...settingsData.systemSettings,
                              maintenanceMode: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                      </div>
                    </div>
                    {settingsData.systemSettings.autoBackup && (
                      <div>
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select
                          value={settingsData.systemSettings.backupFrequency}
                          onValueChange={(value) => setSettingsData({
                            ...settingsData,
                            systemSettings: {
                              ...settingsData.systemSettings,
                              backupFrequency: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingSettings ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit User Modal Component (View-like with editable fields)
  const EditUserModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit User Details</h2>
                  <p className="text-sm text-gray-600">Modify user information</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditUser(false)}
                className="rounded-full p-2"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Editable User Information */}
            <div className="space-y-4">
              {/* Name */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Full Name</p>
                    <Input
                      value={editUserFormData.name}
                      onChange={(e) => setEditUserFormData({ ...editUserFormData, name: e.target.value })}
                      className="bg-white border-blue-200 focus:border-blue-400"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">Email Address</p>
                    <Input
                      type="email"
                      value={editUserFormData.email}
                      onChange={(e) => setEditUserFormData({ ...editUserFormData, email: e.target.value })}
                      className="bg-white border-green-200 focus:border-green-400"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Eye className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-amber-600 uppercase tracking-wide font-medium mb-1">Password</p>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={editUserFormData.password}
                        onChange={(e) => setEditUserFormData({ ...editUserFormData, password: e.target.value })}
                        className="bg-white border-amber-200 focus:border-amber-400 flex-1"
                        placeholder="Enter password"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const randomPassword = Math.random().toString(36).slice(-8);
                          setEditUserFormData({ ...editUserFormData, password: randomPassword });
                          toast.success("Random password generated!");
                        }}
                        className="text-amber-600 border-amber-300 hover:bg-amber-50"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-teal-600 uppercase tracking-wide font-medium mb-1">Phone Number</p>
                    <Input
                      type="tel"
                      value={editUserFormData.phone || ""}
                      onChange={(e) => setEditUserFormData({ ...editUserFormData, phone: e.target.value })}
                      className="bg-white border-teal-200 focus:border-teal-400"
                      placeholder="number"
                    />
                  </div>
                </div>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-orange-600 uppercase tracking-wide font-medium mb-1">Age</p>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={editUserFormData.age || ""}
                        onChange={(e) => setEditUserFormData({
                          ...editUserFormData,
                          age: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        className="bg-white border-orange-200 focus:border-orange-400"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-pink-600 uppercase tracking-wide font-medium mb-1">Gender</p>
                      <Select
                        value={editUserFormData.gender || ""}
                        onValueChange={(value: "male" | "female" | "other") =>
                          setEditUserFormData({ ...editUserFormData, gender: value })
                        }
                      >
                        <SelectTrigger className="bg-white border-pink-200 focus:border-pink-400">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">User Role</p>
                    <Select
                      value={editUserFormData.role}
                      onValueChange={(value: "patient" | "admin") => setEditUserFormData({ ...editUserFormData, role: value })}
                    >
                      <SelectTrigger className="bg-white border-purple-200 focus:border-purple-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Join Date (Read-only) */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Joined Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditUser(false)}
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={isSavingUser}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingUser ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
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
                className="flex items-center space-x-2 relative"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Notifications</span>
                {getUnreadCount() > 0 && (
                  <Badge className="bg-red-500 text-white px-1.5 py-0.5 text-xs absolute -top-1 -right-1">
                    {getUnreadCount()}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={() => {
                  window.open('/hospital-display', '_blank');
                }}
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden md:inline">Hospital Display</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 relative"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
                {settingsData.systemSettings.maintenanceMode && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
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
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <p className="text-blue-100 text-xs mt-1">
                      +12% from last month
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">
                      Total Appointments
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.totalAppointments}
                    </p>
                    <p className="text-indigo-100 text-xs mt-1">
                      +8% from last month
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-indigo-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      Pending
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.pendingAppointments}
                    </p>
                    <p className="text-yellow-100 text-xs mt-1">
                      Needs attention
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Completed
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.completedAppointments}
                    </p>
                    <p className="text-green-100 text-xs mt-1">
                      +15% from last month
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">
                      Cancelled
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.cancelledAppointments}
                    </p>
                    <p className="text-red-100 text-xs mt-1">
                      -5% from last month
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedView === "overview" ? "default" : "outline"}
              onClick={() => setSelectedView("overview")}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </Button>
            <Button
              variant={selectedView === "appointments" ? "default" : "outline"}
              onClick={() => setSelectedView("appointments")}
              className="flex items-center space-x-2"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Appointments</span>
            </Button>
            <Button
              variant={selectedView === "users" ? "default" : "outline"}
              onClick={() => setSelectedView("users")}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Users</span>
            </Button>
            <Button
              variant={selectedView === "analytics" ? "default" : "outline"}
              onClick={() => setSelectedView("analytics")}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            <Button
              variant={selectedView === "messages" ? "default" : "outline"}
              onClick={() => setSelectedView("messages")}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </Button>
          </div>
        </div>

        {/* Content based on selected view */}
        {selectedView === "overview" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {appointment.title}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center space-x-2">
                            <span className="flex items-center space-x-1">
                              <UserIcon className="h-3 w-3" />
                              <span>
                                {appointment.user?.name || `Patient ID: ${appointment.user_id}`}
                              </span>
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={() => setIsCreateUserModalOpen(true)}
                  >
                    <div className="flex flex-col items-center">
                      <UserPlus className="h-5 w-5 mb-1" />
                      <span className="text-sm">Add User</span>
                    </div>
                  </Button>
                  <Button
                    className="h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={() => {
                      setSelectedView("appointments");
                      toast.success(
                        "Switched to appointments view - you can manage bookings here!",
                      );
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <Calendar className="h-5 w-5 mb-1" />
                      <span className="text-sm">Book Appointment</span>
                    </div>
                  </Button>
                  <Button
                    className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => {
                      // Generate and download a sample CSV file
                      const csvContent = `Name,Email,Role,Created Date\n${users
                        .map(
                          (user) =>
                            `"${user.name}","${user.email}","${user.role}","${new Date(user.created_at).toLocaleDateString()}"`,
                        )
                        .join("\n")}`;

                      const blob = new Blob([csvContent], { type: "text/csv" });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);

                      toast.success("User data exported successfully!");
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <Download className="h-5 w-5 mb-1" />
                      <span className="text-sm">Export Data</span>
                    </div>
                  </Button>
                  <Button
                    className="h-16 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => {
                      setSelectedView("messages");
                      toast.success(
                        "Opened Messages section - compose your message here!",
                      );
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <MessageSquare className="h-5 w-5 mb-1" />
                      <span className="text-sm">Send Message</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === "appointments" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <span>Appointment Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage and track all patient appointments
                  </CardDescription>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full md:w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Appointments Found
                    </h3>
                    <p className="text-gray-600">
                      No appointments match your current search or filter.
                    </p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {appointment.title}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <UserIcon className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-purple-700">
                              {appointment.user?.name || `Patient ID: ${appointment.user_id}`}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAppointmentDetails(true);
                          }}
                          className="ml-4 hover:bg-gray-100 transition-colors"
                          title="View appointment details"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === "users" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>User Management</span>
                  </CardTitle>
                  <CardDescription>Manage all registered users</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={handleClearAllUsers}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Users
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={() => setIsCreateUserModalOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-xl bg-white transition-all duration-200 ${
                      editingUserId === user.id
                        ? "border-blue-300 shadow-lg bg-blue-50"
                        : "border-gray-200 hover:shadow-md hover:border-gray-300"
                    }`}
                  >
                    {editingUserId === user.id ? (
                      // Inline Edit Mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-blue-700">Editing User</h3>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUserId(null)}
                              className="text-gray-600 hover:bg-gray-100"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveUser}
                              disabled={isSavingUser}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isSavingUser ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Save
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                            <Input
                              value={editUserFormData.name}
                              onChange={(e) => setEditUserFormData({ ...editUserFormData, name: e.target.value })}
                              className="mt-1"
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Email</Label>
                            <Input
                              type="email"
                              value={editUserFormData.email}
                              onChange={(e) => setEditUserFormData({ ...editUserFormData, email: e.target.value })}
                              className="mt-1"
                              placeholder="Enter email"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Password</Label>
                            <Input
                              type="text"
                              value={editUserFormData.password}
                              onChange={(e) => setEditUserFormData({ ...editUserFormData, password: e.target.value })}
                              className="mt-1"
                              placeholder="Enter password"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Phone</Label>
                            <Input
                              type="tel"
                              value={editUserFormData.phone || ""}
                              onChange={(e) => setEditUserFormData({ ...editUserFormData, phone: e.target.value })}
                              className="mt-1"
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Age</Label>
                            <Input
                              type="number"
                              min="1"
                              max="120"
                              value={editUserFormData.age || ""}
                              onChange={(e) => setEditUserFormData({
                                ...editUserFormData,
                                age: e.target.value ? parseInt(e.target.value) : undefined
                              })}
                              className="mt-1"
                              placeholder="Enter age"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Gender</Label>
                            <Select
                              value={editUserFormData.gender || ""}
                              onValueChange={(value: "male" | "female" | "other") =>
                                setEditUserFormData({ ...editUserFormData, gender: value })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Role</Label>
                            <Select
                              value={editUserFormData.role}
                              onValueChange={(value: "patient" | "admin") => setEditUserFormData({ ...editUserFormData, role: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Normal Display Mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="bg-gray-50 px-2 py-1 rounded mt-1">
                              <p className="text-xs text-gray-700">
                                <strong>Password:</strong> {user.password}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge
                                className={
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              >
                                {user.role}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Joined{" "}
                                {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                            title="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            title="Edit user details"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`${
                              user.role === "admin"
                                ? "text-gray-400 hover:bg-gray-50 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === "admin"}
                            title={user.role === "admin" ? "Cannot delete admin users" : "Delete user"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedView === "analytics" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <ChartErrorBoundary>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Appointment Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px] min-h-[300px]">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      debounce={100}
                    >
                      <LineChart
                        data={appointmentTrends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="appointments"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </ChartErrorBoundary>

            <ChartErrorBoundary>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span>Status Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px] min-h-[300px] flex items-center justify-center">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      debounce={100}
                    >
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </ChartErrorBoundary>
          </div>
        )}

        {selectedView === "messages" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Send Messages</span>
                </CardTitle>
                <CardDescription>
                  Send messages to all patients or individual patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Message Type Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Message Recipients
                    </Label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setMessageType("all")}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          messageType === "all"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>All Patients</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setMessageType("individual")}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          messageType === "individual"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4" />
                          <span>Individual Patient</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Individual Patient Selection */}
                  {messageType === "individual" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="patient-select"
                        className="text-sm font-medium text-gray-700"
                      >
                        Select Patient
                      </Label>
                      <Select
                        value={selectedPatient}
                        onValueChange={setSelectedPatient}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a patient to send message to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {patientUsers.length === 0 ? (
                            <SelectItem value="no-patients" disabled>
                              No patients found
                            </SelectItem>
                          ) : (
                            patientUsers.map((patient) => (
                              <SelectItem
                                key={patient.id}
                                value={patient.id.toString()}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {patient.name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      {patient.name}
                                    </span>
                                    <span className="text-gray-500 text-sm ml-2">
                                      ({patient.email})
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Message Subject */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="message-subject"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subject
                    </Label>
                    <Input
                      id="message-subject"
                      type="text"
                      placeholder="Enter message subject..."
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="message-content"
                      className="text-sm font-medium text-gray-700"
                    >
                      Message Content
                    </Label>
                    <Textarea
                      id="message-content"
                      placeholder="Type your message here..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={6}
                      className="w-full resize-none"
                    />
                    <div className="text-right text-xs text-gray-500">
                      {messageContent.length}/500 characters
                    </div>
                  </div>

                  {/* Send Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {messageType === "all" ? (
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>
                            Will be sent to all {patientUsers.length} patients
                          </span>
                        </span>
                      ) : selectedPatient ? (
                        <span className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4" />
                          <span>
                            Will be sent to{" "}
                            {
                              users.find(
                                (u) => u.id.toString() === selectedPatient,
                              )?.name
                            }
                          </span>
                        </span>
                      ) : (
                        <span className="text-orange-600">
                          Please select a patient
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        isSendingMessage ||
                        !messageSubject.trim() ||
                        !messageContent.trim() ||
                        (messageType === "individual" && !selectedPatient)
                      }
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      {isSendingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onCreateUser={async (userData) => {
          try {
            const response = await fetch("/api/users", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(userData),
            });

            if (response.ok) {
              const newUser = await response.json();
              const userWithPassword = {
                ...newUser,
                password: userData.password, // Keep password for display
              };

              setUsers(prevUsers => [...prevUsers, userWithPassword]);
              fetchStats();
              
              // Trigger notification for new user
              triggerUserCreatedNotification(userData.name, userData.role);
              
              toast.success("User created successfully!");
            } else {
              const error = await response.json();
              toast.error(error.message || "Failed to create user");
            }
          } catch (error) {
            toast.error("Failed to create user");
          }
        }}
      />

      {/* Appointment Details Modal */}
      {showAppointmentDetails && <AppointmentDetailsModal />}

      {/* Edit Appointment Modal */}
      {showEditAppointment && <EditAppointmentModal />}

      {/* User Details Modal */}
      {showUserDetails && <UserDetailsModal />}

      {/* Edit User Modal */}
      {showEditUser && <EditUserModal />}

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}

      {/* Notifications Modal */}
      {showNotifications && <NotificationsModal />}

      {/* Notification Preferences Modal */}
      {showNotificationPreferences && <NotificationPreferencesModal />}
    </div>
  );
};

export default AdminDashboard;
