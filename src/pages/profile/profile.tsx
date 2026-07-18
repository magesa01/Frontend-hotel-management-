import { motion } from 'framer-motion';
import { CalendarRange, Mail, Pencil, Phone, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { ImageUpload } from '@/components/shared/image-upload';
import { RatingStars } from '@/components/shared/rating-stars';
import { RoleBadge, BookingStatusBadge } from '@/components/shared/badges';
import { profileSchema, type ProfileForm } from '@/utils/schemas';
import { useAuth } from '@/contexts/auth-context';
import { useUpdateUser } from '@/hooks/use-users';
import { useUserBookings } from '@/hooks/use-bookings';
import { useReviews } from '@/hooks/resource-hooks';
import type { Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate, initials } from '@/utils/format';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const updateMut = useUpdateUser();
  const bookingsQ = useUserBookings(user?.id);
  const reviewsQ = useReviews();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userReviews = reviewsQ.data?.items.filter((r: Review) => r.userId === user?.id) ?? [];

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl ?? '' } : undefined,
  });

  const avatarUrl = watch('avatarUrl');

  const onSubmit = async (data: ProfileForm) => {
    setSubmitting(true);
    try {
      if (user) {
        await updateMut.mutateAsync({ id: user.id, payload: data });
        updateProfile(data);
        toast.success('Profile updated');
        setEditing(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Profile" description="Your account and activity" icon={<UserCircle className="size-5" />} actions={!editing && <Button variant="outline" className="gap-2" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit profile</Button>} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="h-24 bg-gradient-to-br from-primary to-secondary-600" />
            <div className="px-5 pb-5">
              <div className="-mt-10 flex items-end justify-between">
                <Avatar className="size-20 border-4 border-card">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-lg font-bold">{initials(user.name)}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="mt-3 font-display text-lg font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-3"><RoleBadge role={user.role} /></div>
              <dl className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm"><Mail className="size-4 text-muted-foreground" /> {user.email}</div>
                <div className="flex items-center gap-2 text-sm"><Phone className="size-4 text-muted-foreground" /> {user.phone}</div>
                <div className="flex items-center gap-2 text-sm"><CalendarRange className="size-4 text-muted-foreground" /> Joined {formatDate(user.createdAt)}</div>
              </dl>
            </div>
          </Card>
        </div>

        {/* Details / edit / history */}
        <div className="lg:col-span-2">
          {editing ? (
            <Card className="p-6">
              <h3 className="mb-4 font-display text-base font-semibold">Edit profile</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
                    <Input id="name" {...register('name')} />
                  </FormField>
                  <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
                    <Input id="email" type="email" {...register('email')} />
                  </FormField>
                  <FormField label="Phone" htmlFor="phone" error={errors.phone?.message} required className="sm:col-span-2">
                    <Input id="phone" {...register('phone')} />
                  </FormField>
                </div>
                <ImageUpload value={avatarUrl} onChange={(url) => setValue('avatarUrl', url)} label="Avatar" />
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save changes'}</Button>
                  <Button type="button" variant="ghost" onClick={() => { reset(); setEditing(false); }}>Cancel</Button>
                </div>
              </form>
            </Card>
          ) : (
            <Tabs defaultValue="bookings">
              <TabsList>
                <TabsTrigger value="bookings">Booking history</TabsTrigger>
                <TabsTrigger value="reviews">Review history</TabsTrigger>
              </TabsList>
              <TabsContent value="bookings" className="mt-4">
                <Card className="p-5">
                  <h3 className="mb-3 font-display text-base font-semibold">Your bookings</h3>
                  {bookingsQ.isLoading ? <div className="h-32 animate-pulse rounded-lg bg-muted" /> : bookingsQ.data?.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {bookingsQ.data?.map((b, i) => (
                        <motion.div key={b.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                          <div><p className="text-sm font-semibold">{b.reference}</p><p className="text-2xs text-muted-foreground">{formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} nights</p></div>
                          <div className="flex items-center gap-3"><span className="text-sm font-bold">{formatCurrency(b.totalAmount)}</span><BookingStatusBadge status={b.status} /></div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <Card className="p-5">
                  <h3 className="mb-3 font-display text-base font-semibold">Your reviews</h3>
                  {userReviews.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet.</p> : (
                    <div className="space-y-3">
                      {userReviews.map((r: Review, i: number) => (
                        <motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="rounded-lg border border-border/60 p-3">
                          <div className="flex items-center justify-between"><RatingStars value={r.rating} size={14} readonly /><span className="text-2xs text-muted-foreground">{formatDate(r.createdAt)}</span></div>
                          <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}