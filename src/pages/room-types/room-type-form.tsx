import { ArrowLeft, BedDouble } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { ImageUpload } from '@/components/shared/image-upload';
import { roomTypeSchema, type RoomTypeForm } from '@/utils/schemas';
import { useRoomType, useCreateRoomType, useUpdateRoomType } from '@/hooks/resource-hooks';
import { useHotelsLookup } from '@/hooks/use-relations';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RoomTypeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const detailQ = useRoomType(id);
  const createMut = useCreateRoomType();
  const updateMut = useUpdateRoomType();
  const hotelsQ = useHotelsLookup();
  const [submitting, setSubmitting] = useState(false);

  const isHotelAdmin = user?.role === 'HOTEL_ADMIN';

  useEffect(() => {
    if (isEdit && detailQ.data && isHotelAdmin) {
      if (detailQ.data.hotelId !== user?.assignedHotelId) {
        navigate('/403', { replace: true });
      }
    }
  }, [isEdit, detailQ.data, isHotelAdmin, user, navigate]);

  const availableHotels = isHotelAdmin
    ? (hotelsQ.data?.filter((h) => h.id === user?.assignedHotelId) ?? [])
    : (hotelsQ.data ?? []);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<RoomTypeForm>({
    resolver: zodResolver(roomTypeSchema),
    values: detailQ.data
      ? { ...detailQ.data, amenities: detailQ.data.amenities as unknown as string }
      : isHotelAdmin && user?.assignedHotelId
        ? ({ hotelId: user.assignedHotelId } as RoomTypeForm)
        : undefined,
  });

  const hotelId = watch('hotelId');
  const imageUrl = watch('imageUrl');

  const onSubmit = async (data: RoomTypeForm) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        amenities: data.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
          .join(', '),
      };
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload });
        toast.success('Room type updated');
      } else {
        await createMut.mutateAsync({ hotelId: data.hotelId, payload });
        toast.success('Room type created');
      }
      navigate('/room-types');
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
      <PageHeader title={isEdit ? 'Edit room type' : 'New room type'} description={isEdit ? 'Update room configuration' : 'Add a new room configuration'} icon={<BedDouble className="size-5" />} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hotel" error={errors.hotelId?.message} required className="sm:col-span-2">
              <Select value={hotelId} onValueChange={(v) => setValue('hotelId', v, { shouldValidate: true })} disabled={isHotelAdmin}>
                <SelectTrigger><SelectValue placeholder="Select a hotel" /></SelectTrigger>
                <SelectContent>{availableHotels.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required className="sm:col-span-2">
              <Input id="name" placeholder="Deluxe Sea View" {...register('name')} />
            </FormField>
            <FormField label="Description" htmlFor="description" error={errors.description?.message} required className="sm:col-span-2">
              <Textarea id="description" rows={3} {...register('description')} />
            </FormField>
            <FormField label="Price / night (USD)" htmlFor="price" error={errors.price?.message} required>
              <Input id="price" type="number" min="1" placeholder="320" {...register('price')} />
            </FormField>
            <FormField label="Capacity (guests)" htmlFor="capacity" error={errors.capacity?.message} required>
              <Input id="capacity" type="number" min="1" max="10" placeholder="2" {...register('capacity')} />
            </FormField>
            <FormField label="Bed type" htmlFor="bedType" error={errors.bedType?.message} required>
              <Input id="bedType" placeholder="King" {...register('bedType')} />
            </FormField>
            <FormField label="Size (m²)" htmlFor="sizeSqm" error={errors.sizeSqm?.message} required>
              <Input id="sizeSqm" type="number" min="5" placeholder="38" {...register('sizeSqm')} />
            </FormField>
            <FormField label="Amenities (comma-separated)" htmlFor="amenities" error={errors.amenities?.message} className="sm:col-span-2" hint="e.g. Sea View, Balcony, Minibar">
              <Input id="amenities" placeholder="Sea View, Balcony, Minibar" {...register('amenities')} />
            </FormField>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <ImageUpload value={imageUrl} onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })} label="Room image" />
          {errors.imageUrl && <p className="mt-1 text-2xs font-medium text-danger">{errors.imageUrl.message}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create room type'}</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}