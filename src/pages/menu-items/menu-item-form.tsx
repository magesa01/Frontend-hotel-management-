import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { FormField } from '@/components/shared/form-field';
import { ImageUpload } from '@/components/shared/image-upload';
import { menuItemSchema, type MenuItemForm } from '@/utils/schemas';
import { useMenuItem, useCreateMenuItem, useUpdateMenuItem } from '@/hooks/resource-hooks';
import { useRestaurantsLookup } from '@/hooks/use-relations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { MenuCategory } from '@/types';

const CATEGORIES: MenuCategory[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'DRINK', 'SNACK'];

export default function MenuItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const detailQ = useMenuItem(id);
  const createMut = useCreateMenuItem();
  const updateMut = useUpdateMenuItem();
  const restaurantsQ = useRestaurantsLookup();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    values: detailQ.data
      ? { restaurantId: detailQ.data.restaurantId, name: detailQ.data.name, description: detailQ.data.description, category: detailQ.data.category, price: detailQ.data.price, imageUrl: detailQ.data.imageUrl, isAvailable: detailQ.data.isAvailable }
      : { isAvailable: true, category: 'LUNCH' } as MenuItemForm,
  });

  const restaurantId = watch('restaurantId');
  const category = watch('category');
  const isAvailable = watch('isAvailable');
  const imageUrl = watch('imageUrl');

  const onSubmit = async (data: MenuItemForm) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateMut.mutateAsync({ id, payload: data });
        toast.success('Menu item updated');
      } else {
        const { restaurantId: targetRestaurantId, ...payload } = data;
        await createMut.mutateAsync({ restaurantId: targetRestaurantId, payload });
        toast.success('Menu item created');
      }
      navigate('/menu-items');
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
      <PageHeader title={isEdit ? 'Edit menu item' : 'New menu item'} description={isEdit ? 'Update dish details' : 'Add a new dish'} icon={<ClipboardList className="size-5" />} />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Restaurant" error={errors.restaurantId?.message} required className="sm:col-span-2">
              <Select value={restaurantId} onValueChange={(v) => setValue('restaurantId', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                <SelectContent>{restaurantsQ.data?.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" placeholder="Sea Bream Crudo" {...register('name')} />
            </FormField>
            <FormField label="Price (USD)" htmlFor="price" error={errors.price?.message} required>
              <Input id="price" type="number" min="1" placeholder="24" {...register('price')} />
            </FormField>
            <FormField label="Category" error={errors.category?.message} required>
              <Select value={category} onValueChange={(v) => setValue('category', v as MenuCategory, { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Available" hint="Toggle if this item is currently served">
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={isAvailable} onCheckedChange={(v) => setValue('isAvailable', v)} />
                <span className="text-sm text-muted-foreground">{isAvailable ? 'Available' : 'Unavailable'}</span>
              </div>
            </FormField>
            <FormField label="Description" htmlFor="description" error={errors.description?.message} required className="sm:col-span-2">
              <Textarea id="description" rows={3} {...register('description')} />
            </FormField>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <ImageUpload value={imageUrl} onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })} label="Food image" />
          {errors.imageUrl && <p className="mt-1 text-2xs font-medium text-danger">{errors.imageUrl.message}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create item'}</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}