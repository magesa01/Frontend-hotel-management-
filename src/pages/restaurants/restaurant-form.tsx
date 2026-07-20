import { ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { ImageUpload } from '@/components/shared/image-upload';
import { restaurantSchema, type RestaurantForm } from '@/utils/schemas';
import { useRestaurant, useCreateRestaurant, useUpdateRestaurant } from '@/hooks/resource-hooks';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RestaurantFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const detailQ = useRestaurant(id);
  const createMut = useCreateRestaurant();
  const updateMut = useUpdateRestaurant();
  const hotelsQ = useHotelsLookup();
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isHotelAdmin = user?.role === 'HOTEL_ADMIN';
  const isRestaurantAdmin = user?.role === 'RESTAURANT_ADMIN';

  // Zuia RESTAURANT_ADMIN kuhariri mgahawa usiokuwa wake, na HOTEL_ADMIN kuhariri mgahawa wa hoteli isiyokuwa yake
  useEffect(() => {
    if (isEdit && detailQ.data) {
      if (isRestaurantAdmin && detailQ.data.id !== user?.assignedRestaurantId) {
        navigate('/403', { replace: true });
      } else if (isHotelAdmin && detailQ.data.hotelId !== user?.assignedHotelId) {
        navigate('/403', { replace: true });
      }
    }
  }, [isEdit, detailQ.data, isRestaurantAdmin, isHotelAdmin, user, navigate]);

  // Hoteli zinazoonekana kwenye dropdown: HOTEL_ADMIN aone hoteli yake tu
  const availableHotels = isHotelAdmin
    ? (hotelsQ.data?.filter((h) => h.id === user?.assignedHotelId) ?? [])
    : (hotelsQ.data ?? []);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<RestaurantForm>({
    resolver: zodResolver(restaurantSchema),
    values: detailQ.data
      ? { hotelId: detailQ.data.hotelId, name: detailQ.data.name, description: detailQ.data.description, cuisine: detailQ.data.cuisine, imageUrl: detailQ.data.imageUrl, openingHours: detailQ.data.openingHours, phone: detailQ.data.phone, rating: detailQ.data.rating }
      : isHotelAdmin && user?.assignedHotelId
        ? ({ hotelId: user.assignedHotelId } as RestaurantForm)
        : undefined,
  });

  const hotelId = watch('hotelId');
  const imageUrl = watch('imageUrl');

  const onSubmit = async (data: RestaurantForm) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload: data });
        toast.success('Restaurant updated');
        navigate(`/restaurants/${id}`);
      } else {
        const { hotelId: targetHotelId, ...payload } = data;
        const created = await createMut.mutateAsync({ hotelId: targetHotelId, payload });
        toast.success('Restaurant created');
        navigate(`/restaurants/${created.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && detailQ.isLoading) return <div className="h-96 animate-pulse rounded-xl bg-muted" />;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}><ArrowLeft className="size-4" /> Back</Button>
      <PageHeader title={isEdit ? 'Edit restaurant' : 'New restaurant'} description={isEdit ? 'Update venue details' : 'Add a dining venue'} icon={<UtensilsCrossed className="size-5" />} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hotel" error={errors.hotelId?.message} required className="sm:col-span-2">
              <Select value={hotelId} onValueChange={(v) => setValue('hotelId', v, { shouldValidate: true })} disabled={isHotelAdmin}>
                <SelectTrigger><SelectValue placeholder="Select hotel" /></SelectTrigger>
                <SelectContent>{availableHotels.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" placeholder="Marina Blu" {...register('name')} />
            </FormField>
            <FormField label="Cuisine" htmlFor="cuisine" error={errors.cuisine?.message} required>
              <Input id="cuisine" placeholder="Mediterranean" {...register('cuisine')} />
            </FormField>
            <FormField label="Opening hours" htmlFor="openingHours" error={errors.openingHours?.message} required>
              <Input id="openingHours" placeholder="12:00–23:00" {...register('openingHours')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required>
              <Input id="phone" placeholder="+34 932 11 44 55" {...register('phone')} />
            </FormField>
            <FormField label="Rating (0–5)" htmlFor="rating" error={errors.rating?.message} required>
              <Input id="rating" type="number" step="0.1" min="0" max="5" placeholder="4.7" {...register('rating')} />
            </FormField>
            <FormField label="Description" htmlFor="description" error={errors.description?.message} required className="sm:col-span-2">
              <Textarea id="description" rows={3} {...register('description')} />
            </FormField>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <ImageUpload value={imageUrl} onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })} label="Restaurant image" />
          {errors.imageUrl && <p className="mt-1 text-2xs font-medium text-danger">{errors.imageUrl.message}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create restaurant'}</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}