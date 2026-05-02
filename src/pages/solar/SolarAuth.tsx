import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, LogIn, ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { solarAuth } from "@/lib/solarAuth";
import { runtimeConfig } from "@/lib/runtimeConfig";
import logoSolar from "@/assets/logo-solar.png";

const SolarAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ name: "", email: "", password: "", confirm: "" });

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn.email || !signIn.password) {
      toast.error("Email and password required");
      return;
    }
    setLoading(true);
    try {
      await solarAuth.signInEmail(signIn.email, signIn.password);
      toast.success("Welcome back");
      navigate("/subsidiaries/solar/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp.name || !signUp.email || !signUp.password) {
      toast.error("All fields required");
      return;
    }
    if (signUp.password !== signUp.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (signUp.password.length < 8 || !/[A-Za-z]/.test(signUp.password) || !/\d/.test(signUp.password)) {
      toast.error("Password must be 8+ characters with letters and numbers");
      return;
    }
    setLoading(true);
    try {
      await solarAuth.signUpEmail(signUp.email, signUp.password, signUp.name);
      toast.success("Account created");
      navigate("/subsidiaries/solar/kyc");
    } catch (error: any) {
      toast.error(error?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-8.5rem)] flex items-center bg-hero overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-black/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,hsl(var(--primary)/0.35),transparent_60%)]" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl animate-float" />

      <div className="container-px relative z-10 w-full">
        <div className="max-w-md mx-auto bg-background/95 backdrop-blur-md border border-border p-8 md:p-10 shadow-elegant">
          <div className="flex flex-col items-center text-center mb-8">
            <img src={logoSolar} alt="AZB Solar" className="h-12 w-12 object-contain mb-4" />
            <p className="eyebrow text-primary mb-2">Solar Client Portal</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Access your account</h1>
            <p className="text-sm text-muted-foreground">Manage KYC, loans and energy bookings.</p>
          </div>

          <div className="mb-5 flex justify-center">
            {runtimeConfig.googleClientId ? (
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) {
                    toast.error("Google sign-in failed");
                    return;
                  }
                  setLoading(true);
                  try {
                    await solarAuth.signInGoogle(credentialResponse.credential);
                    toast.success("Signed in with Google");
                    navigate("/subsidiaries/solar/dashboard");
                  } catch (error: any) {
                    toast.error(error?.message || "Google sign-in failed");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => toast.error("Google sign-in failed")}
              />
            ) : (
              <p className="text-xs text-muted-foreground">Google sign-in is not configured yet.</p>
            )}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-5">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={onSignIn} className="space-y-4">
                <Field icon={<Mail className="h-4 w-4" />} label="Email">
                  <Input type="email" value={signIn.email} onChange={(e) => setSignIn((s) => ({ ...s, email: e.target.value }))} placeholder="you@example.com" className="pl-10 h-11" />
                </Field>
                <Field icon={<Lock className="h-4 w-4" />} label="Password">
                  <Input type="password" value={signIn.password} onChange={(e) => setSignIn((s) => ({ ...s, password: e.target.value }))} placeholder="********" className="pl-10 h-11" />
                </Field>
                <SubmitBtn loading={loading}>Sign In</SubmitBtn>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={onSignUp} className="space-y-4">
                <Field icon={<User className="h-4 w-4" />} label="Full Name">
                  <Input value={signUp.name} onChange={(e) => setSignUp((s) => ({ ...s, name: e.target.value }))} placeholder="Jane Doe" className="pl-10 h-11" />
                </Field>
                <Field icon={<Mail className="h-4 w-4" />} label="Email">
                  <Input type="email" value={signUp.email} onChange={(e) => setSignUp((s) => ({ ...s, email: e.target.value }))} placeholder="you@example.com" className="pl-10 h-11" />
                </Field>
                <Field icon={<Lock className="h-4 w-4" />} label="Password">
                  <Input type="password" value={signUp.password} onChange={(e) => setSignUp((s) => ({ ...s, password: e.target.value }))} placeholder="At least 8 chars, letters + numbers" className="pl-10 h-11" />
                </Field>
                <Field icon={<Lock className="h-4 w-4" />} label="Confirm Password">
                  <Input type="password" value={signUp.confirm} onChange={(e) => setSignUp((s) => ({ ...s, confirm: e.target.value }))} placeholder="Re-enter password" className="pl-10 h-11" />
                </Field>
                <SubmitBtn loading={loading}>Create Account</SubmitBtn>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing you agree to AZB Solar terms. Need help?{" "}
            <Link to="/contact" className="text-primary hover:text-primary-glow font-semibold">Contact us</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

const Field = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      {children}
    </div>
  </div>
);

const SubmitBtn = ({ loading, children }: { loading: boolean; children: React.ReactNode }) => (
  <button type="submit" disabled={loading} className="group w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground h-11 text-sm font-semibold uppercase tracking-[0.15em] transition-smooth shadow-elegant disabled:opacity-60">
    <LogIn className="h-4 w-4" /> {children}
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </button>
);

export default SolarAuth;
