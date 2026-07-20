import { ArrowLeft, ShieldPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { createAdminSchema, type CreateAdminForm } from '@/utils/schemas';
import { authService } from '@/services/auth.service';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useRestaurants } from '@/hooks/resource-hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminManagersPage() {
  const navigate = useNavigate();
  const hotelsQ = useHotelsLookup();
  const restaurantsQ = useRestaurants();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { fullName: '', email: '', phoneNumber: '', password: '', role: 'HOTEL_ADMIN' },
  });

  const role = watch('role');

  const onSubmit = async (data: CreateAdminForm) => {
    setSubmitting(true);
    try {
      await authService.createAdminAccount({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: data.role,
        hotelId: data.role === 'HOTEL_ADMIN' ? data.hotelId : undefined,
        restaurantId: data.role === 'RESTAURANT_ADMIN' ? data.restaurantId : undefined,
      });
      toast.success(`${data.fullName} can now sign in as a ${data.role === 'HOTEL_ADMIN' ? 'Hotel' : 'Restaurant'} Admin`);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create admin account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" /> Back
      </Button>
      <PageHeader
        title="Add admin"
        description="Create a Hotel Admin or Restaurant Admin account and assign them a property"
        icon={<ShieldPlus className="size-5" />}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message} required>
              <Input id="fullName" placeholder="Jane Doe" {...register('fullName')} />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" placeholder="admin@example.com" {...register('email')} />
            </FormField>
            <FormField label="Phone number" htmlFor="phoneNumber" error={errors.phoneNumber?.message} required>
              <Input id="phoneNumber" type="tel" placeholder="+255 7XX XXX XXX" {...register('phoneNumber')} />
            </FormField>
            <FormField label="Temporary password" htmlFor="password" error={errors.password?.message} required hint="Share this with the admin so they can sign in and change it">
              <Input id="password" type="text" placeholder="••••••••" {...register('password')} />
            </FormField>

            <FormField label="Admin type" error={errors.role?.message} required className="sm:col-span-2">
              <Select value={role} onValueChange={(v) => setValue('role', v as CreateAdminForm['role'], { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select admin type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOTEL_ADMIN">Hotel Admin</SelectItem>
                  <SelectItem value="RESTAURANT_ADMIN">Restaurant Admin</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {role === 'HOTEL_ADMIN' && (
              <FormField label="Assign to hotel" error={errors.hotelId?.message} required className="sm:col-span-2">
                <Select value={watch('hotelId') ?? ''} onValueChange={(v) => setValue('hotelId', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select a hotel" /></SelectTrigger>
                  <SelectContent>
                    {hotelsQ.data?.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            )}

            {role === 'RESTAURANT_ADMIN' && (
              <FormField label="Assign to restaurant" error={errors.restaurantId?.message} required className="sm:col-span-2">
                <Select value={watch('restaurantId') ?? ''} onValueChange={(v) => setValue('restaurantId', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select a restaurant" /></SelectTrigger>
                  <SelectContent>
                    {restaurantsQ.data?.items.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create admin account'}</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
        </div>
      </form>
    </div>
  );
}