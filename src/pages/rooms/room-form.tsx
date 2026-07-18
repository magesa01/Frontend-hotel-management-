import { ArrowLeft, DoorOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { roomSchema, type RoomForm } from '@/utils/schemas';
import { useRoom, useCreateRoom, useUpdateRoom } from '@/hooks/resource-hooks';
import { useHotelsLookup, useRoomTypesByHotel } from '@/hooks/use-relations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RoomStatus } from '@/types';

const STATUSES: { value: RoomStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
];

export default function RoomFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const detailQ = useRoom(id);
  const createMut = useCreateRoom();
  const updateMut = useUpdateRoom();
  const hotelsQ = useHotelsLookup();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    values: detailQ.data
      ? { hotelId: detailQ.data.hotelId, roomTypeId: detailQ.data.roomTypeId, roomNumber: detailQ.data.roomNumber, floor: detailQ.data.floor, status: detailQ.data.status }
      : undefined,
  });

  const hotelId = watch('hotelId');
  const roomTypeId = watch('roomTypeId');
  const status = watch('status');
  const roomTypesQ = useRoomTypesByHotel(hotelId);

  const onSubmit = async (data: RoomForm) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload: data });
        toast.success('Room updated');
      } else {
        const { roomTypeId: targetRoomTypeId, roomNumber, floor } = data;
        await createMut.mutateAsync({ roomTypeId: targetRoomTypeId, payload: { roomNumber, floor } });
        toast.success('Room created');
      }
      navigate('/rooms');
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
      <PageHeader title={isEdit ? 'Edit room' : 'New room'} description={isEdit ? 'Update room details' : 'Add a new room'} icon={<DoorOpen className="size-5" />} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hotel" error={errors.hotelId?.message} required className="sm:col-span-2">
              <Select value={hotelId} onValueChange={(v) => { setValue('hotelId', v, { shouldValidate: true }); setValue('roomTypeId', '', { shouldValidate: true }); }}>
                <SelectTrigger><SelectValue placeholder="Select a hotel" /></SelectTrigger>
                <SelectContent>{hotelsQ.data?.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Room type" error={errors.roomTypeId?.message} required className="sm:col-span-2">
              <Select value={roomTypeId} onValueChange={(v) => setValue('roomTypeId', v, { shouldValidate: true })} disabled={!hotelId}>
                <SelectTrigger><SelectValue placeholder={hotelId ? 'Select a room type' : 'Select a hotel first'} /></SelectTrigger>
                <SelectContent>{roomTypesQ.data?.map((rt) => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Room number" htmlFor="roomNumber" error={errors.roomNumber?.message} required>
              <Input id="roomNumber" placeholder="101" {...register('roomNumber')} />
            </FormField>
            <FormField label="Floor" htmlFor="floor" error={errors.floor?.message} required>
              <Input id="floor" type="number" min="0" placeholder="1" {...register('floor')} />
            </FormField>
            {isEdit && (
              <FormField label="Status" error={errors.status?.message} required className="sm:col-span-2">
                <Select value={status} onValueChange={(v) => setValue('status', v as RoomStatus, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create room'}</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}