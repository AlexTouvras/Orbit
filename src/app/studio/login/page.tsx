import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/studio/LoginForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock } from "lucide-react";

export default async function StudioLoginPage() {
  if (await isAuthenticated()) redirect("/studio");

  return (
    <div className="mx-auto max-w-md">
      <GlassCard className="p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Lock className="h-5 w-5 text-neon-cyan" />
          </div>
          <h1 className="text-xl font-bold text-white">Studio access</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter your password to manage Orbit.
          </p>
        </div>
        <LoginForm />
      </GlassCard>
    </div>
  );
}
