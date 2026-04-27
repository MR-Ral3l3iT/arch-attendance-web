"use client";

import Image from "next/image";
import { useState, Suspense } from "react";
import logoArchd from "@/assets/logo-archd.png";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Alert } from "@/components/ui";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import api from "@/lib/api";
import type { AuthTokens } from "@/types";

const schema = z.object({
  username: z.string().min(1, "กรุณากรอก username"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type FormValues = z.infer<typeof schema>;

const ROLE_HOME: Record<string, string> = {
  ADMIN:   "/admin",
  TEACHER: "/teacher",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const { data } = await api.post<AuthTokens>("/auth/login", values);
      login(data);
      toast.success(`ยินดีต้อนรับ ${data.user.firstName}!`);
      const redirect = params.get("redirect");
      const dest = redirect ?? ROLE_HOME[data.user.role] ?? "/";
      router.replace(dest);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setServerError(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="danger" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )}

      <Input
        label="Username"
        placeholder="รหัสนักศึกษา / รหัสอาจารย์ / admin"
        leftIcon={<User size={16} />}
        error={errors.username?.message}
        autoComplete="username"
        {...register("username")}
      />

      <Input
        label="รหัสผ่าน"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.password?.message}
        autoComplete="current-password"
        {...register("password")}
      />

      <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card-md px-8 py-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-12 h-12 mb-3 rounded-xl overflow-hidden bg-white ring-1 ring-gray-100">
            <Image
              src={logoArchd}
              alt=""
              fill
              sizes="48px"
              className="object-contain p-1"
              priority
            />
          </div>
          <h1 className="text-center text-xl font-bold">
            <span className="text-primary">ARCHD</span>{" "}
            <span className="text-black">Attendance</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">ระบบบันทึกการเข้าเรียน</p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        หากมีปัญหาการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ
      </p>
    </div>
  );
}
