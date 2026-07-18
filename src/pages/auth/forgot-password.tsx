import { motion } from 'framer-motion';
import { ArrowLeft, Hotel, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/utils/schemas';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(data.email);
      setSent(true);
      toast.success('Reset link sent');
    } catch {
      toast.error('Could not send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary-600 text-primary-foreground">
            <Hotel className="size-6" />
          </div>
          {sent ? (
            <>
              <div className="mb-3 grid size-14 place-items-center rounded-full bg-success/10">
                <MailCheck className="size-7 text-success" />
              </div>
              <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for that email, a reset link is on its way.
              </p>
              <Button asChild variant="outline" className="mt-6 gap-2">
                <Link to="/login"><ArrowLeft className="size-4" /> Back to sign in</Link>
              </Button>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Reset your password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we'll send you a reset link.
              </p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" placeholder="you@aurelia.com" {...register('email')} />
            </FormField>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
            <Button asChild variant="ghost" className="w-full gap-2">
              <Link to="/login"><ArrowLeft className="size-4" /> Back to sign in</Link>
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
