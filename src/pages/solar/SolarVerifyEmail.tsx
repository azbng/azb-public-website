import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { solarAuth } from "@/lib/solarAuth";

const SolarVerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setMessage("Verification token is missing.");
      return;
    }

    solarAuth
      .verifyEmail(token)
      .then(() => {
        setState("success");
        setMessage("Email verified. You can now sign in.");
        window.setTimeout(() => {
          navigate("/subsidiaries/solar/auth");
        }, 1600);
      })
      .catch((error: any) => {
        setState("error");
        setMessage(error?.message || "Verification failed. The link may be invalid or expired.");
      });
  }, [navigate, searchParams]);

  return (
    <section className="section-py min-h-[calc(100vh-8.5rem)] bg-background">
      <div className="container-px max-w-xl">
        <div className="border border-border bg-surface p-8 text-center shadow-card">
          <div className="mx-auto mb-4 h-12 w-12 grid place-items-center bg-primary/10 text-primary">
            {state === "loading" ? <Loader2 className="h-6 w-6 animate-spin" /> : null}
            {state === "success" ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : null}
            {state === "error" ? <XCircle className="h-6 w-6 text-destructive" /> : null}
          </div>
          <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          {state !== "loading" ? (
            <div className="mt-6">
              <Link to="/subsidiaries/solar/auth" className="inline-flex items-center justify-center h-10 px-5 text-xs font-semibold uppercase tracking-[0.15em] border border-border hover:border-primary">
                Go to Sign In
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default SolarVerifyEmail;
