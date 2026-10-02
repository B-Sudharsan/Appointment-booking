import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Calendar, Heart, Shield, Clock, Users, Star } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Index() {
  // MediBook Landing Page with Authentication
  const { login, register, googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerAge, setRegisterAge] = useState("");
  const [registerGender, setRegisterGender] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      setIsLoading(false);
      return;
    }
    if (!registerName.trim()) {
      toast.error("Please enter your full name");
      setIsLoading(false);
      return;
    }
    if (!registerEmail.trim()) {
      toast.error("Please enter your email address");
      setIsLoading(false);
      return;
    }
    if (!registerPassword.trim()) {
      toast.error("Please enter a password");
      setIsLoading(false);
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }
    if (!registerPhone.trim()) {
      toast.error("Please enter your phone number");
      setIsLoading(false);
      return;
    }
    if (!registerAge.trim() || isNaN(Number(registerAge)) || Number(registerAge) < 1) {
      toast.error("Please enter a valid age");
      setIsLoading(false);
      return;
    }
    if (!registerGender.trim()) {
      toast.error("Please select your gender");
      setIsLoading(false);
      return;
    }

    try {
      await register(registerName, registerEmail, registerPassword, registerPhone, Number(registerAge), registerGender);
      toast.success("Registration successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Initialize Google Sign-In
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: "your-google-client-id.apps.googleusercontent.com", // Replace with your actual Google Client ID
          callback: async (response: any) => {
            try {
              await googleLogin(response.credential);
              toast.success("Successfully signed in with Google!");
            } catch (error) {
              toast.error("Failed to sign in with Google");
              console.error("Google sign-in error:", error);
            } finally {
              setIsLoading(false);
            }
          },
        });

        window.google.accounts.id.prompt();
      } else {
        throw new Error("Google Sign-In not loaded");
      }
    } catch (error) {
      toast.error("Failed to initialize Google Sign-In");
      console.error("Google Sign-In initialization error:", error);
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    if (provider === 'google') {
      await handleGoogleSignIn();
    } else {
      // For other providers, show a message that they're not implemented yet
      toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">MediBook</h1>
            </div>
            <div className="text-sm text-gray-600">
              Healthcare Appointment Management
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Modern Healthcare
                <span className="text-blue-600"> Appointment System</span>
              </h2>
              <p className="text-xl text-gray-600">
                Streamline your healthcare appointments with our easy-to-use booking platform.
                Designed for both patients and healthcare providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Easy Booking</h3>
                  <p className="text-gray-600">Schedule appointments with just a few clicks</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
                  <p className="text-gray-600">Get instant notifications about your appointments</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                  <p className="text-gray-600">Your health data is protected and encrypted</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
                  <p className="text-gray-600">Comprehensive management tools for healthcare providers</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-900">Demo Credentials & Google OAuth</span>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Admin:</strong> admin@example.com (any password)</p>
                <p><strong>Patient:</strong> Create a new account or use john@example.com / password123</p>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <p><strong>Google Sign-In:</strong> To enable Google OAuth:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Set up Google Cloud Console project</li>
                    <li>Enable Google Sign-In API</li>
                    <li>Create OAuth 2.0 credentials</li>
                    <li>Update client/config/google.ts with your Client ID</li>
                    <li>Update server environment variables</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="max-w-md mx-auto w-full">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to MediBook</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <div className="space-y-4">
                      {/* Social Login Buttons - All 4 in one line with icons only */}
                      <div className="flex justify-center space-x-3">
                        {/* Google */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('google')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign in with Google"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </Button>

                        {/* Facebook */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('facebook')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign in with Facebook"
                        >
                          <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </Button>

                        {/* Apple */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('apple')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign in with Apple"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                          </svg>
                        </Button>

                        {/* Yahoo */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('yahoo')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign in with Yahoo"
                        >
                          <svg className="w-6 h-6" fill="#6001D2" viewBox="0 0 24 24">
                            <path d="M0 0h7.2l3.4 6.4L14 0h7.2L15 12v12H9V12L0 0z"/>
                          </svg>
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                      </div>

                      {/* Email/Password Form */}
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>

                  <TabsContent value="register">
                    <div className="space-y-4">
                      {/* Social Login Buttons - All 4 in one line with icons only */}
                      <div className="flex justify-center space-x-3">
                        {/* Google */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('google')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign up with Google"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </Button>

                        {/* Facebook */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('facebook')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign up with Facebook"
                        >
                          <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </Button>

                        {/* Apple */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('apple')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign up with Apple"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                          </svg>
                        </Button>

                        {/* Yahoo */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialAuth('yahoo')}
                          disabled={isLoading}
                          className="flex items-center justify-center p-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
                          title="Sign up with Yahoo"
                        >
                          <svg className="w-6 h-6" fill="#6001D2" viewBox="0 0 24 24">
                            <path d="M0 0h7.2l3.4 6.4L14 0h7.2L15 12v12H9V12L0 0z"/>
                          </svg>
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                      </div>

                      {/* Registration Form */}
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="register-name">Full Name</Label>
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="John Doe"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          required
                        />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="your@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-phone">Phone Number</Label>
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-age">Age</Label>
                          <Input
                            id="register-age"
                            type="number"
                            placeholder="0"
                            min="1"
                            max="120"
                            value={registerAge}
                            onChange={(e) => setRegisterAge(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-gender">Gender</Label>
                          <Select value={registerGender} onValueChange={setRegisterGender} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Password</Label>
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Create a password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-confirm-password">Re-type Password</Label>
                          <Input
                            id="register-confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                          />
                          <Label
                            htmlFor="terms"
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I agree to the{" "}
                            <a
                              href="#"
                              className="text-blue-600 hover:text-blue-800 underline"
                              onClick={(e) => {
                                e.preventDefault();
                                toast.info("Terms and conditions would be displayed here");
                              }}
                            >
                              Terms and Conditions
                            </a>{" "}
                            and{" "}
                            <a
                              href="#"
                              className="text-blue-600 hover:text-blue-800 underline"
                              onClick={(e) => {
                                e.preventDefault();
                                toast.info("Privacy policy would be displayed here");
                              }}
                            >
                              Privacy Policy
                            </a>
                          </Label>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
