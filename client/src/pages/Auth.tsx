import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Role = "STUDENT" | "CARETAKER" | "MANAGEMENT";

export default function Auth() {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  // common
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");

  // student
  const [hostel, setHostel] = useState("");
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");

  // caretaker / management
  const [hostels, setHostels] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        const payload: any = {
          name,
          email,
          password,
          role,
        };

        if (role === "STUDENT") {
          payload.hostel = hostel;
          payload.block = block;
          payload.room = room;
        } else {
          payload.hostels = hostels.split(",").map(h => h.trim());
        }

        await register(payload);
        toast.success("Account created successfully!");
      }

      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please check the details.");
    }
  };

  const handleDemoLogin = async (roleType: "student" | "management") => {
    const credentials = {
      student: { email: "student@hostel.edu", password: "demo123" },
      management: { email: "admin@hostel.edu", password: "demo123" },
    };

    const creds = credentials[roleType];
    setEmail(creds.email);
    setPassword(creds.password);

    try {
      await login(creds.email, creds.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">HostelCare</h1>
            <p className="text-sm text-muted-foreground">
              Issue Management System
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Sign in to your account to continue"
                : "Register to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    className="w-full border rounded-md p-2 bg-background"
                    value={role}
                    onChange={e => setRole(e.target.value as Role)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="CARETAKER">Caretaker</option>
                    <option value="MANAGEMENT">Management</option>
                  </select>
                </div>
              )}

              {mode === "register" && role === "STUDENT" && (
                <>
                  <div className="space-y-2">
                    <Label>Hostel</Label>
                    <Input value={hostel} onChange={e => setHostel(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Block</Label>
                    <Input value={block} onChange={e => setBlock(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Input value={room} onChange={e => setRoom(e.target.value)} required />
                  </div>
                </>
              )}

              {mode === "register" && role !== "STUDENT" && (
                <div className="space-y-2">
                  <Label>Hostels (comma separated)</Label>
                  <Input
                    placeholder="Krishna, Aryabhatta"
                    value={hostels}
                    onChange={e => setHostels(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Register"
                )}
              </Button>
            </form>

            <p className="text-center text-sm mt-4">
              {mode === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-primary font-medium hover:underline"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>

            {mode === "login" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Demo Accounts
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => handleDemoLogin("student")} disabled={isLoading}>
                    Student
                  </Button>
                  <Button variant="outline" onClick={() => handleDemoLogin("management")} disabled={isLoading}>
                    Management
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This is a demo. Use the buttons above to explore different roles.
        </p>
      </div>
    </div>
  );
}
