import { ArrowLeft, CalendarRange } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { bookingSchema, type BookingForm } from '@/utils/schemas';
import { useCreateBooking, useUpdateBooking, useBooking } from '@/hooks/use-bookings';
import { useHotelsLookup, useRoomTypesByHotel, useRoomsLookup } from '@/hooks/use-relations';
import { useAuth } from '@/contexts/auth-context';
import { nightsBetween } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BookingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const detailQ = useBooking(id);
  const createMut = useCreateBooking();
  const updateMut = useUpdateBooking();
  const hotelsQ = useHotelsLookup();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    values: detailQ.data
      ? { hotelId: detailQ.data.hotelId, roomId: detailQ.data.roomId, guestName: detailQ.data.guestName, guestEmail: detailQ.data.guestEmail, checkIn: detailQ.data.checkIn, checkOut: detailQ.data.checkOut, guests: detailQ.data.guests, totalAmount: detailQ.data.totalAmount, notes: detailQ.data.notes ?? '' }
      : { guestName: user?.name ?? '', guestEmail: user?.email ?? '', guests: 1 } as BookingForm,
  });

  const hotelId = watch('hotelId');
  const roomTypeId = watch('roomTypeId' as any);
  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  const roomTypesQ = useRoomTypesByHotel(hotelId);
  const roomsQ = useRoomsLookup();

  const availableRooms = roomsQ.data?.filter((r) => r.hotelId === hotelId && r.status === 'AVAILABLE') ?? [];
  const selectedRoomType = roomTypesQ.data?.find((rt) => rt.id === roomTypeId);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const computedTotal = selectedRoomType ? selectedRoomType.price * nights : 0;

  const onSubmit = async (data: BookingForm) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        const payload = { ...data, totalAmount: data.totalAmount || computedTotal };
        await updateMut.mutateAsync({ id, payload });
        toast.success('Booking updated');
        navigate(`/bookings/${id}`);
      } else {
        // bookingService.create expects { profileId, roomId, checkIn, checkOut, guests, notes } —
        // the backend derives hotel/rate/guest details from the room and profile itself.
        const payload = {
          profileId: user?.id ?? '',
          roomId: data.roomId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          notes: data.notes,
        };
        const created = await createMut.mutateAsync(payload);
        toast.success('Booking created');
        navigate(`/bookings/${created.id}`);
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
      <PageHeader title={isEdit ? 'Edit booking' : 'New booking'} description={isEdit ? 'Update reservation details' : 'Create a new reservation'} icon={<CalendarRange className="size-5" />} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Guest</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Guest name" htmlFor="guestName" error={errors.guestName?.message} required>
              <Input id="guestName" {...register('guestName')} />
            </FormField>
            <FormField label="Guest email" htmlFor="guestEmail" error={errors.guestEmail?.message} required>
              <Input id="guestEmail" type="email" {...register('guestEmail')} />
            </FormField>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold">Stay</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hotel" error={errors.hotelId?.message} required>
              <Select value={hotelId} onValueChange={(v) => { setValue('hotelId', v, { shouldValidate: true }); setValue('roomId', '', { shouldValidate: true }); }}>
                <SelectTrigger><SelectValue placeholder="Select hotel" /></SelectTrigger>
                <SelectContent>{hotelsQ.data?.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Room type" hint="Auto-selected from available room" className="sm:col-span-2">
              <Select value={roomTypeId ?? ''} onValueChange={(v) => setValue('roomTypeId' as any, v)}>
                <SelectTrigger><SelectValue placeholder={hotelId ? 'Select room type' : 'Select hotel first'} /></SelectTrigger>
                <SelectContent>{roomTypesQ.data?.map((rt) => <SelectItem key={rt.id} value={rt.id}>{rt.name} — ${rt.price}/nt</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Room" error={errors.roomId?.message} required>
              <Select value={watch('roomId')} onValueChange={(v) => setValue('roomId', v, { shouldValidate: true })} disabled={!hotelId}>
                <SelectTrigger><SelectValue placeholder={hotelId ? 'Select room' : 'Select hotel first'} /></SelectTrigger>
                <SelectContent>{availableRooms.map((r) => <SelectItem key={r.id} value={r.id}>Room {r.roomNumber} (Floor {r.floor})</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Guests" htmlFor="guests" error={errors.guests?.message} required>
              <Input id="guests" type="number" min="1" {...register('guests')} />
            </FormField>
            <FormField label="Check-in" htmlFor="checkIn" error={errors.checkIn?.message} required>
              <Input id="checkIn" type="date" {...register('checkIn')} />
            </FormField>
            <FormField label="Check-out" htmlFor="checkOut" error={errors.checkOut?.message} required>
              <Input id="checkOut" type="date" {...register('checkOut')} />
            </FormField>
          </div>
          {nights > 0 && selectedRoomType && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 p-3">
              <span className="text-sm text-muted-foreground">{nights} nights × {selectedRoomType.name}</span>
              <span className="font-bold text-primary">${computedTotal.toLocaleString()}</span>
            </div>
          )}
          <div className="mt-4">
            <FormField label="Total amount (USD)" htmlFor="totalAmount" error={errors.totalAmount?.message} required hint="Override the calculated total if needed">
              <Input id="totalAmount" type="number" min="1" placeholder={computedTotal ? String(computedTotal) : '0'} {...register('totalAmount')} />
            </FormField>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
            <Textarea id="notes" rows={3} placeholder="Special requests…" {...register('notes')} />
          </FormField>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create booking'}</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}