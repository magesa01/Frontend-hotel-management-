import { ArrowLeft, Building2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { ImageUpload } from '@/components/shared/image-upload';
import { hotelSchema, type HotelForm } from '@/utils/schemas';
import { hotelHooks } from '@/hooks/resource-hooks';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function HotelFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useDetail, useCreate, useUpdate } = hotelHooks;
  const detailQ = useDetail(id);
  const createMut = useCreate();
  const updateMut = useUpdate();
  const [submitting, setSubmitting] = useState(false);

  // Zuia HOTEL_ADMIN asihariri hoteli isiyokuwa yake
  useEffect(() => {
    if (isEdit && detailQ.data && user?.role === 'HOTEL_ADMIN') {
      if (detailQ.data.id !== user.assignedHotelId) {
        navigate('/403', { replace: true });
      }
    }
  }, [isEdit, detailQ.data, user, navigate]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<HotelForm>({
    resolver: zodResolver(hotelSchema),
    values: detailQ.data
      ? {
          name: detailQ.data.name,
          description: detailQ.data.description,
          location: detailQ.data.location,
          city: detailQ.data.city,
          country: detailQ.data.country,
          rating: detailQ.data.rating,
          imageUrl: detailQ.data.imageUrl,
        }
      : undefined,
  });

  const imageUrl = watch('imageUrl');

  const onSubmit = async (data: HotelForm) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload: data });
        toast.success('Hotel updated successfully');
        navigate(`/hotels/${id}`);
      } else {
        const created = await createMut.mutateAsync(data);
        toast.success('Hotel created successfully');
        navigate(`/hotels/${created.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && detailQ.isLoading) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" /> Back
      </Button>

      <PageHeader
        title={isEdit ? 'Edit hotel' : 'New hotel'}
        description={isEdit ? 'Update property details' : 'Add a new property to your portfolio'}
        icon={<Building2 className="size-5" />}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hotel name" htmlFor="name" error={errors.name?.message} required className="sm:col-span-2">
              <Input id="name" placeholder="Aurelia Grand Riviera" {...register('name')} />
            </FormField>
            <FormField label="Location" htmlFor="location" error={errors.location?.message} required>
              <Input id="location" placeholder="Marina Promenade" {...register('location')} />
            </FormField>
            <FormField label="City" htmlFor="city" error={errors.city?.message} required>
              <Input id="city" placeholder="Barcelona" {...register('city')} />
            </FormField>
            <FormField label="Country" htmlFor="country" error={errors.country?.message} required>
              <Input id="country" placeholder="Spain" {...register('country')} />
            </FormField>
            <FormField label="Rating (0–5)" htmlFor="rating" error={errors.rating?.message} required>
              <Input id="rating" type="number" step="0.1" min="0" max="5" placeholder="4.8" {...register('rating')} />
            </FormField>
            <FormField label="Description" htmlFor="description" error={errors.description?.message} required className="sm:col-span-2">
              <Textarea id="description" rows={4} placeholder="Describe the property…" {...register('description')} />
            </FormField>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <ImageUpload value={imageUrl} onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })} label="Hotel image" />
          {errors.imageUrl && <p className="mt-1 text-2xs font-medium text-danger">{errors.imageUrl.message}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create hotel'}</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}