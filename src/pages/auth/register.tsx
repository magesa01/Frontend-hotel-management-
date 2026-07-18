import { motion } from 'framer-motion';
import { Hotel, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { registerSchema, type RegisterForm } from '@/utils/schemas';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      const result = await registerUser({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
      });
      if (result.requiresEmailConfirmation) {
        toast.success('Account created — check your email to confirm before signing in.');
        navigate('/login');
      } else {
        toast.success('Welcome to Aurelia HMS');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl shadow-2xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-foreground lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary to-secondary-600" />
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Hotel className="size-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">Aurelia HMS</p>
                <p className="text-xs text-primary-foreground/70">Hotel Management Platform</p>
              </div>
            </div>

            <div className="max-w-md">
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="font-display text-4xl font-bold leading-tight"
              >
                Join Aurelia and book smarter stays.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-4 text-lg text-primary-foreground/80"
              >
                Create a free customer account to book rooms and dine across our partner hotels.
              </motion.p>

              <div className="mt-10 space-y-4">
                {[
                  { icon: TrendingUp, title: 'Track your bookings', desc: 'See upcoming and past stays in one place.' },
                  { icon: Sparkles, title: 'Faster checkout', desc: 'Save your details for quicker future bookings.' },
                  { icon: ShieldCheck, title: 'Secure by design', desc: 'Your password is handled by Supabase Auth, never our servers.' },
                ].map((feat, i) => (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3 rounded-xl bg-white/10 p-3 backdrop-blur"
                  >
                    <feat.icon className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{feat.title}</p>
                      <p className="text-sm text-primary-foreground/70">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="text-xs text-primary-foreground/50">© 2026 Aurelia Hospitality Group. All rights reserved.</p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-background p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 lg:hidden">
              <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary-600 text-primary-foreground">
                <Hotel className="size-6" />
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer accounts only. Hotel and restaurant staff are onboarded by an administrator.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
                <Input id="fullName" type="text" placeholder="Augustine John" {...register('fullName')} />
              </FormField>
              <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
                <Input id="email" type="email" placeholder="you@aurelia.com" {...register('email')} />
              </FormField>
              <FormField label="Phone number" htmlFor="phoneNumber" error={errors.phoneNumber?.message} required>
                <Input id="phoneNumber" type="tel" placeholder="+255 7XX XXX XXX" {...register('phoneNumber')} />
              </FormField>
              <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              </FormField>
              <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
              </FormField>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}