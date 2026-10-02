import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { User, Appointment, Message, CreateAppointmentRequest } from "@shared/api";

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

// Middleware
app.use(cors());
app.use(express.json());

// Mock data - replace with actual database
let users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password_hash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    phone: "+1234567890",
    address: "123 Admin St, City, State",
    age: 35,
    gender: "male",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    password_hash: bcrypt.hashSync("password123", 10),
    role: "patient",
    phone: "+1234567891",
    address: "456 Patient Ave, City, State",
    age: 28,
    gender: "male",
    created_at: new Date().toISOString(),
  },
];

let appointments: Appointment[] = [
  {
    id: "1",
    user_id: "2",
    title: "General Checkup",
    date: "2024-01-15",
    start_time: "10:00",
    end_time: "11:00",
    status: "confirmed",
    notes: "Regular health checkup",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "2",
    title: "Follow-up Consultation",
    date: "2024-01-20",
    start_time: "14:00",
    end_time: "15:00",
    status: "pending",
    notes: "Follow-up for previous checkup",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "2",
    title: "Blood Test",
    date: "2024-01-10",
    start_time: "09:00",
    end_time: "09:30",
    status: "completed",
    notes: "Annual blood work",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    user_id: "2",
    title: "Dental Checkup",
    date: new Date().toISOString().split('T')[0], // Today's date
    start_time: "10:30",
    end_time: "11:30",
    status: "pending",
    notes: "Routine dental examination",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    user_id: "2",
    title: "Physical Therapy",
    date: new Date().toISOString().split('T')[0], // Today's date
    start_time: "15:00",
    end_time: "16:00",
    status: "confirmed",
    notes: "Knee rehabilitation session",
    created_at: new Date().toISOString(),
  },
];

let messages: Message[] = [
  {
    id: "1",
    user_id: "2",
    content: "Hello, I need to reschedule my appointment.",
    created_at: new Date().toISOString(),
    is_read: false,
  },
  {
    id: "2",
    user_id: "2",
    content: "Welcome to MediBook! Your account has been created successfully.",
    subject: "Welcome to MediBook",
    message_text: "Welcome to MediBook! Your account has been created successfully. You can now book appointments and manage your healthcare needs.",
    created_at: new Date().toISOString(),
    is_read: false,
    is_broadcast: true,
  },
  {
    id: "3",
    user_id: "2",
    content: "Your appointment has been confirmed for tomorrow at 10:00 AM.",
    subject: "Appointment Confirmation",
    message_text: "Your appointment has been confirmed for tomorrow at 10:00 AM. Please arrive 15 minutes early.",
    created_at: new Date().toISOString(),
    is_read: true,
  },
];

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, phone, age, gender } = req.body;

  // Validation
  if (!name || !email || !password || !phone || !age || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  if (age < 1 || age > 120) {
    return res.status(400).json({ message: "Please enter a valid age" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: (users.length + 1).toString(),
    name,
    email,
    password_hash: hashedPassword,
    role: "patient",
    phone,
    age,
    gender,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// Google OAuth authentication
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({ message: "Missing required Google profile information" });
    }

    // Check if user already exists
    let user = users.find((u) => u.email === email);

    if (!user) {
      // Create new user from Google profile
      const newUser: User = {
        id: (users.length + 1).toString(),
        name: name,
        email: email,
        password_hash: "", // No password for Google OAuth users
        role: "patient", // Default role for new Google users
        phone: "", // Will be empty, user can update later
        age: 0, // Will be empty, user can update later
        gender: "", // Will be empty, user can update later
        created_at: new Date().toISOString(),
      };

      users.push(newUser);
      user = newUser;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(400).json({ message: "Invalid Google token" });
  }
});

// Appointment routes
app.get("/api/appointments", authenticateToken, (req: any, res) => {
  if (req.user.role === "admin") {
    // For admin, include user details with appointments
    const appointmentsWithUsers = appointments.map(appointment => {
      const user = users.find(u => u.id === appointment.user_id);
      return {
        ...appointment,
        user: user ? {
          name: user.name,
          email: user.email,
          phone: user.phone,
          age: user.age,
          gender: user.gender
        } : null
      };
    });
    res.json(appointmentsWithUsers);
  } else {
    const userAppointments = appointments.filter(
      (apt) => apt.user_id === req.user.userId
    );
    res.json(userAppointments);
  }
});

app.get("/api/appointments/user", authenticateToken, (req: any, res) => {
  const userAppointments = appointments.filter(
    (apt) => apt.user_id === req.user.userId
  );
  res.json(userAppointments);
});

app.post("/api/appointments", authenticateToken, (req: any, res) => {
  const appointmentData: CreateAppointmentRequest = req.body;

  const newAppointment: Appointment = {
    id: (appointments.length + 1).toString(),
    user_id: req.user.userId,
    title: appointmentData.title,
    date: appointmentData.date,
    start_time: appointmentData.start_time,
    end_time: appointmentData.end_time,
    status: "pending",
    notes: appointmentData.notes || "",
    created_at: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

app.put("/api/appointments/:id", authenticateToken, (req: any, res) => {
  const appointmentId = req.params.id;
  const updates = req.body;

  const appointmentIndex = appointments.findIndex(
    (apt) => apt.id === appointmentId
  );

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Check if user owns the appointment or is admin
  if (
    req.user.role !== "admin" &&
    appointments[appointmentIndex].user_id !== req.user.userId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    ...updates,
  };

  res.json(appointments[appointmentIndex]);
});

// Specific endpoint for updating appointment status
app.put("/api/appointments/:id/status", authenticateToken, (req: any, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  // Validate status
  const validStatuses = ["pending", "confirmed", "completed", "cancelled", "rescheduled", "no-show"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Valid statuses are: " + validStatuses.join(", ")
    });
  }

  const appointmentIndex = appointments.findIndex(
    (apt) => apt.id === appointmentId
  );

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Check if user owns the appointment or is admin
  if (
    req.user.role !== "admin" &&
    appointments[appointmentIndex].user_id !== req.user.userId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Update only the status
  appointments[appointmentIndex].status = status;

  res.json({
    message: `Appointment status updated to ${status}`,
    appointment: appointments[appointmentIndex]
  });
});

// Reschedule appointment endpoint
app.put("/api/appointments/:id/reschedule", authenticateToken, (req: any, res) => {
  const appointmentId = req.params.id;
  const { date, start_time, end_time, notes } = req.body;

  if (!date || !start_time || !end_time) {
    return res.status(400).json({
      message: "Date, start_time, and end_time are required for rescheduling"
    });
  }

  const appointmentIndex = appointments.findIndex(
    (apt) => apt.id === appointmentId
  );

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Check if user owns the appointment or is admin
  if (
    req.user.role !== "admin" &&
    appointments[appointmentIndex].user_id !== req.user.userId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Update appointment with new schedule
  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    date,
    start_time,
    end_time,
    status: "rescheduled",
    notes: notes || appointments[appointmentIndex].notes
  };

  res.json({
    message: "Appointment rescheduled successfully",
    appointment: appointments[appointmentIndex]
  });
});

// Send reminder endpoint
app.post("/api/appointments/:id/reminder", authenticateToken, (req: any, res) => {
  const appointmentId = req.params.id;

  const appointment = appointments.find((apt) => apt.id === appointmentId);

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Check if user owns the appointment or is admin
  if (
    req.user.role !== "admin" &&
    appointment.user_id !== req.user.userId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Find the patient
  const patient = users.find(u => u.id === appointment.user_id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  // Create a reminder message
  const reminderMessage: Message = {
    id: (messages.length + 1).toString(),
    user_id: appointment.user_id,
    content: `Reminder: You have an appointment "${appointment.title}" scheduled for ${appointment.date} at ${appointment.start_time}. Please arrive 15 minutes early.`,
    subject: "Appointment Reminder",
    message_text: `Reminder: You have an appointment "${appointment.title}" scheduled for ${appointment.date} at ${appointment.start_time}. Please arrive 15 minutes early.`,
    created_at: new Date().toISOString(),
    is_read: false,
  };

  messages.push(reminderMessage);

  res.json({
    message: `Reminder sent to ${patient.name} (${patient.email})`,
    reminder: reminderMessage
  });
});

app.delete("/api/appointments/:id", authenticateToken, (req: any, res) => {
  const appointmentId = req.params.id;

  const appointmentIndex = appointments.findIndex(
    (apt) => apt.id === appointmentId
  );

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Check if user owns the appointment or is admin
  if (
    req.user.role !== "admin" &&
    appointments[appointmentIndex].user_id !== req.user.userId
  ) {
    return res.status(403).json({ message: "Access denied" });
  }

  appointments.splice(appointmentIndex, 1);
  res.status(204).send();
});

// Message routes
app.get("/api/messages", authenticateToken, (req: any, res) => {
  if (req.user.role === "admin") {
    res.json(messages);
  } else {
    const userMessages = messages.filter((msg) => msg.user_id === req.user.userId);
    res.json(userMessages);
  }
});

app.get("/api/messages/user", authenticateToken, (req: any, res) => {
  const userMessages = messages.filter((msg) => msg.user_id === req.user.userId);
  res.json(userMessages);
});

app.post("/api/messages", authenticateToken, (req: any, res) => {
  const { content } = req.body;

  const newMessage: Message = {
    id: (messages.length + 1).toString(),
    user_id: req.user.userId,
    content,
    created_at: new Date().toISOString(),
    is_read: false,
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);
});

// Admin messaging endpoints
app.post("/api/messages/admin", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { subject, message_text, is_broadcast, receiver_id } = req.body;

  if (is_broadcast) {
    // Send to all patients
    const patientUsers = users.filter(u => u.role === "patient");
    const broadcastMessages = patientUsers.map(user => ({
      id: (messages.length + Math.random()).toString(),
      user_id: user.id,
      content: message_text,
      subject,
      message_text,
      created_at: new Date().toISOString(),
      is_read: false,
      is_broadcast: true,
    }));

    messages.push(...broadcastMessages);
    res.status(201).json({ message: `Broadcast sent to ${patientUsers.length} patients` });
  } else if (receiver_id) {
    // Send to specific user
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      user_id: receiver_id.toString(),
      content: message_text,
      subject,
      message_text,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    messages.push(newMessage);
    res.status(201).json(newMessage);
  } else {
    res.status(400).json({ message: "Either broadcast or receiver_id is required" });
  }
});

// Statistics endpoint
app.get("/api/stats", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const stats = {
    totalUsers: users.length,
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === "pending").length,
    confirmedAppointments: appointments.filter(a => a.status === "confirmed").length,
    completedAppointments: appointments.filter(a => a.status === "completed").length,
    cancelledAppointments: appointments.filter(a => a.status === "cancelled").length,
    newUsersThisMonth: users.filter(u => {
      const userDate = new Date(u.created_at);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
    }).length,
    appointmentsThisMonth: appointments.filter(a => {
      const appointmentDate = new Date(a.created_at);
      const now = new Date();
      return appointmentDate.getMonth() === now.getMonth() && appointmentDate.getFullYear() === now.getFullYear();
    }).length,
    revenue: appointments.filter(a => a.status === "completed").length * 100, // Mock revenue
    revenueGrowth: 15.5, // Mock growth percentage
  };

  res.json(stats);
});

// User routes (admin only)
app.get("/api/users", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const safeUsers = users.map(({ password_hash, ...user }) => user);
  res.json(safeUsers);
});

app.post("/api/users", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { name, email, password, role, phone, age } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: (users.length + 1).toString(),
    name,
    email,
    password_hash: hashedPassword,
    role: role as "admin" | "patient",
    phone,
    age,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  const { password_hash, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.put("/api/users/:id", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const userId = req.params.id;
  const updates = req.body;

  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  // If password is being updated, hash it
  if (updates.password) {
    updates.password_hash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  const { password_hash, ...safeUser } = users[userIndex];
  res.json(safeUser);
});

app.delete("/api/users/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const userId = req.params.id;
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent deleting admin users
  if (users[userIndex].role === "admin") {
    return res.status(403).json({ message: "Cannot delete admin users" });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export function createServer() {
  return app;
}

// Only start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}