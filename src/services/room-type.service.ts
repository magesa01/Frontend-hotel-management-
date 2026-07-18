import { db } from '@/api/mock-data';
import { delay, notFound, toPaginated } from '@/api/mock-helpers';
import type { Paginated, QueryParams, RoomType } from '@/types';

export const roomTypeService = {
  async list(params: QueryParams = {}): Promise<Paginated<RoomType>> {
    return delay(toPaginated(db.roomTypes, params, ['name', 'bedType', 'hotelId']));
  },

  async listByHotel(hotelId: string): Promise<RoomType[]> {
    return delay(db.roomTypes.filter((rt) => rt.hotelId === hotelId));
  },

  async getById(id: string): Promise<RoomType> {
    const rt = db.roomTypes.find((r) => r.id === id);
    if (!rt) throw notFound('Room type not found');
    return delay(rt);
  },

  async create(payload: Omit<RoomType, 'id' | 'createdAt'>): Promise<RoomType> {
    const rt: RoomType = { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    db.roomTypes.unshift(rt);
    return delay(rt);
  },

  async update(id: string, payload: Partial<RoomType>): Promise<RoomType> {
    const idx = db.roomTypes.findIndex((r) => r.id === id);
    if (idx === -1) throw notFound('Room type not found');
    db.roomTypes[idx] = { ...db.roomTypes[idx], ...payload };
    return delay(db.roomTypes[idx]);
  },

  async remove(id: string): Promise<{ id: string }> {
    const idx = db.roomTypes.findIndex((r) => r.id === id);
    if (idx === -1) throw notFound('Room type not found');
    db.roomTypes.splice(idx, 1);
    return delay({ id });
  },
};
