import type {
  Activity,
  Booking,
  Hotel,
  MenuItem,
  Restaurant,
  Review,
  Room,
  RoomType,
  User,
} from '@/types';

/**
 * In-memory mock dataset mirroring the Spring Boot backend models.
 * Every entity carries a UUID generated server-side — the frontend never mints IDs.
 * Replace src/services/*.ts with real axios calls to swap this layer out 1:1.
 */

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const UUID_FN = uuid;

const HOTEL_IMG = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
const ROOM_IMG = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
const FOOD_IMG = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
const AVATAR = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;

export const HOTELS: Hotel[] = [
  { id: uuid(), name: 'Aurelia Grand Riviera', description: 'A waterfront flagship blending timeless Mediterranean elegance with intuitive modern service.', location: 'Marina Promenade', city: 'Barcelona', country: 'Spain', rating: 4.8, imageUrl: HOTEL_IMG('1571003123894'), managerId: undefined, createdAt: '2024-01-12T09:00:00Z', updatedAt: '2025-06-20T11:30:00Z' },
  { id: uuid(), name: 'The Aurelia Skyline', description: 'A glass tower above the harbor with skyline suites and a rooftop infinity pool.', location: 'Harbor District', city: 'Singapore', country: 'Singapore', rating: 4.9, imageUrl: HOTEL_IMG('259154'), managerId: undefined, createdAt: '2024-02-03T08:15:00Z', updatedAt: '2025-07-01T14:00:00Z' },
  { id: uuid(), name: 'Aurelia Alpine Lodge', description: 'A slopeside chalet with private spas, ski concierge, and fireside dining.', location: 'Verbier Valley', city: 'Verbier', country: 'Switzerland', rating: 4.7, imageUrl: HOTEL_IMG('1582784546817'), managerId: undefined, createdAt: '2024-03-18T10:20:00Z', updatedAt: '2025-05-12T09:45:00Z' },
  { id: uuid(), name: 'Aurelia Marrakech Palais', description: 'A restored riad palace with inner gardens, hammam, and rooftop dining under the stars.', location: 'Medina Quarter', city: 'Marrakech', country: 'Morocco', rating: 4.6, imageUrl: HOTEL_IMG('1581418733548'), managerId: undefined, createdAt: '2024-04-22T07:40:00Z', updatedAt: '2025-06-30T16:10:00Z' },
  { id: uuid(), name: 'Aurelia Kyoto Gardens', description: 'A serene retreat tucked between temple gardens with onsen suites and kaiseki dining.', location: 'Higashiyama', city: 'Kyoto', country: 'Japan', rating: 4.9, imageUrl: HOTEL_IMG('1545569341'), managerId: undefined, createdAt: '2024-05-09T12:00:00Z', updatedAt: '2025-07-10T08:25:00Z' },
  { id: uuid(), name: 'Aurelia Manhattan Towers', description: 'A contemporary Midtown address with skyline lofts and a members-only club floor.', location: 'Midtown East', city: 'New York', country: 'United States', rating: 4.5, imageUrl: HOTEL_IMG('1564501049412'), managerId: undefined, createdAt: '2024-06-14T15:30:00Z', updatedAt: '2025-06-28T13:55:00Z' },
];

export const ROOM_TYPES: RoomType[] = [
  { id: uuid(), hotelId: HOTELS[0].id, name: 'Deluxe Sea View', description: 'King bed with a private balcony overlooking the marina.', price: 320, capacity: 2, bedType: 'King', sizeSqm: 38, imageUrl: ROOM_IMG('1648957564341'), amenities: ['Sea View', 'Balcony', 'Minibar', 'Smart TV'], createdAt: '2024-02-01T09:00:00Z' },
  { id: uuid(), hotelId: HOTELS[0].id, name: 'Executive Suite', description: 'Separate lounge, walk-in dressing room, and marble bath.', price: 540, capacity: 3, bedType: 'King', sizeSqm: 62, imageUrl: ROOM_IMG('161189249669'), amenities: ['Lounge', 'Bathtub', 'Espresso', 'Nespresso'], createdAt: '2024-02-01T09:05:00Z' },
  { id: uuid(), hotelId: HOTELS[1].id, name: 'Skyline Infinity Suite', description: 'Floor-to-ceiling glass with private plunge pool.', price: 720, capacity: 2, bedType: 'King', sizeSqm: 75, imageUrl: ROOM_IMG('1631049302323'), amenities: ['Plunge Pool', 'Skyline View', 'Butler'], createdAt: '2024-02-10T08:00:00Z' },
  { id: uuid(), hotelId: HOTELS[2].id, name: 'Alpine Chalet Suite', description: 'Slopeside suite with private sauna and fireplace.', price: 610, capacity: 4, bedType: 'Twin + King', sizeSqm: 80, imageUrl: ROOM_IMG('1551882540615'), amenities: ['Sauna', 'Fireplace', 'Ski Concierge'], createdAt: '2024-03-20T10:00:00Z' },
  { id: uuid(), hotelId: HOTELS[3].id, name: 'Riad Garden Room', description: 'Traditional décor opening to a private courtyard.', price: 280, capacity: 2, bedType: 'Queen', sizeSqm: 34, imageUrl: ROOM_IMG('1547245393892'), amenities: ['Courtyard', 'Hammam Access'], createdAt: '2024-04-25T07:30:00Z' },
  { id: uuid(), hotelId: HOTELS[4].id, name: 'Onsen Garden Suite', description: 'Private hot spring and tatami lounge.', price: 680, capacity: 2, bedType: 'King', sizeSqm: 70, imageUrl: ROOM_IMG('1528908496487'), amenities: ['Onsen', 'Tatami', 'Garden View'], createdAt: '2024-05-10T11:00:00Z' },
  { id: uuid(), hotelId: HOTELS[5].id, name: 'Midtown Loft', description: 'Open-plan loft with skyline windows.', price: 390, capacity: 2, bedType: 'King', sizeSqm: 45, imageUrl: ROOM_IMG('1590490362536'), amenities: ['Skyline View', 'Workspace', 'Bar'], createdAt: '2024-06-15T14:00:00Z' },
];

export const ROOMS: Room[] = [
  { id: uuid(), hotelId: HOTELS[0].id, roomTypeId: ROOM_TYPES[0].id, roomNumber: '101', floor: 1, status: 'AVAILABLE', createdAt: '2024-02-02T08:00:00Z' },
  { id: uuid(), hotelId: HOTELS[0].id, roomTypeId: ROOM_TYPES[0].id, roomNumber: '102', floor: 1, status: 'OCCUPIED', createdAt: '2024-02-02T08:05:00Z' },
  { id: uuid(), hotelId: HOTELS[0].id, roomTypeId: ROOM_TYPES[1].id, roomNumber: '201', floor: 2, status: 'AVAILABLE', createdAt: '2024-02-02T08:10:00Z' },
  { id: uuid(), hotelId: HOTELS[0].id, roomTypeId: ROOM_TYPES[1].id, roomNumber: '202', floor: 2, status: 'CLEANING', createdAt: '2024-02-02T08:15:00Z' },
  { id: uuid(), hotelId: HOTELS[1].id, roomTypeId: ROOM_TYPES[2].id, roomNumber: '3001', floor: 30, status: 'OCCUPIED', createdAt: '2024-02-11T08:00:00Z' },
  { id: uuid(), hotelId: HOTELS[1].id, roomTypeId: ROOM_TYPES[2].id, roomNumber: '3002', floor: 30, status: 'AVAILABLE', createdAt: '2024-02-11T08:05:00Z' },
  { id: uuid(), hotelId: HOTELS[2].id, roomTypeId: ROOM_TYPES[3].id, roomNumber: 'G01', floor: 0, status: 'AVAILABLE', createdAt: '2024-03-21T09:00:00Z' },
  { id: uuid(), hotelId: HOTELS[2].id, roomTypeId: ROOM_TYPES[3].id, roomNumber: 'G02', floor: 0, status: 'MAINTENANCE', createdAt: '2024-03-21T09:05:00Z' },
  { id: uuid(), hotelId: HOTELS[3].id, roomTypeId: ROOM_TYPES[4].id, roomNumber: 'C1', floor: 1, status: 'AVAILABLE', createdAt: '2024-04-26T07:00:00Z' },
  { id: uuid(), hotelId: HOTELS[4].id, roomTypeId: ROOM_TYPES[5].id, roomNumber: 'S01', floor: 1, status: 'OCCUPIED', createdAt: '2024-05-11T10:00:00Z' },
  { id: uuid(), hotelId: HOTELS[4].id, roomTypeId: ROOM_TYPES[5].id, roomNumber: 'S02', floor: 1, status: 'AVAILABLE', createdAt: '2024-05-11T10:05:00Z' },
  { id: uuid(), hotelId: HOTELS[5].id, roomTypeId: ROOM_TYPES[6].id, roomNumber: '1201', floor: 12, status: 'AVAILABLE', createdAt: '2024-06-16T13:00:00Z' },
];

export const RESTAURANTS: Restaurant[] = [
  { id: uuid(), hotelId: HOTELS[0].id, name: 'Marina Blu', description: 'Coastal Mediterranean tasting menu by Chef Liora Vance.', cuisine: 'Mediterranean', imageUrl: FOOD_IMG('151724813700'), openingHours: '12:00–23:00', phone: '+34 932 11 44 55', rating: 4.7, createdAt: '2024-02-05T09:00:00Z' },
  { id: uuid(), hotelId: HOTELS[1].id, name: 'Skyline Sapphire', description: 'Rooftop modern Asian with harbor views.', cuisine: 'Asian Fusion', imageUrl: FOOD_IMG('141423507101'), openingHours: '18:00–01:00', phone: '+65 6555 8899', rating: 4.8, createdAt: '2024-02-12T08:30:00Z' },
  { id: uuid(), hotelId: HOTELS[2].id, name: 'Fireside Alpine', description: 'Cheese fondue and wood-fired alpine classics.', cuisine: 'Swiss Alpine', imageUrl: FOOD_IMG('141423507101'), openingHours: '17:00–23:30', phone: '+41 27 555 12 34', rating: 4.6, createdAt: '2024-03-22T10:00:00Z' },
  { id: uuid(), hotelId: HOTELS[4].id, name: 'Kiku Gardens', description: 'Seasonal kaiseki overlooking the temple garden.', cuisine: 'Japanese Kaiseki', imageUrl: FOOD_IMG('141423507101'), openingHours: '18:00–22:00', phone: '+81 75 555 7788', rating: 4.9, createdAt: '2024-05-12T11:00:00Z' },
  { id: uuid(), hotelId: HOTELS[5].id, name: 'Manhattan Table', description: 'New American brasserie with a raw bar.', cuisine: 'New American', imageUrl: FOOD_IMG('155933935004'), openingHours: '07:00–23:00', phone: '+1 212 555 0192', rating: 4.5, createdAt: '2024-06-17T14:00:00Z' },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: uuid(), restaurantId: RESTAURANTS[0].id, name: 'Sea Bream Crudo', description: 'Citrus, fennel, saffron oil.', category: 'STARTER', price: 24, imageUrl: FOOD_IMG('148592132833690'), isAvailable: true, createdAt: '2024-02-06T09:00:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[0].id, name: 'Saffron Risotto', description: 'Carnaroli, parmesan, saffron.', category: 'MAIN', price: 38, imageUrl: FOOD_IMG('1476124375238'), isAvailable: true, createdAt: '2024-02-06T09:05:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[1].id, name: 'Wagyu Tataki', description: 'Yuzu ponzu, scallion, sesame.', category: 'STARTER', price: 32, imageUrl: FOOD_IMG('154402516284'), isAvailable: true, createdAt: '2024-02-13T08:30:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[1].id, name: 'Black Cod Miso', description: '72-hour marinated, char-grilled.', category: 'MAIN', price: 46, imageUrl: FOOD_IMG('143213956263'), isAvailable: false, createdAt: '2024-02-13T08:35:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[2].id, name: 'Cheese Fondue', description: 'Gruyère, Vacherin, crusty bread.', category: 'MAIN', price: 34, imageUrl: FOOD_IMG('147493606869'), isAvailable: true, createdAt: '2024-03-23T10:00:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[3].id, name: 'Sakura Kaiseki', description: 'Nine-course seasonal tasting.', category: 'MAIN', price: 120, imageUrl: FOOD_IMG('141423507101'), isAvailable: true, createdAt: '2024-05-13T11:00:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[4].id, name: 'Raw Platter', description: 'Oysters, tuna, shrimp, cocktail sauce.', category: 'STARTER', price: 28, imageUrl: FOOD_IMG('155933935004'), isAvailable: true, createdAt: '2024-06-18T14:00:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[4].id, name: 'Dry-Aged Ribeye', description: '45-day aged, bone marrow butter.', category: 'MAIN', price: 58, imageUrl: FOOD_IMG('1546833999389'), isAvailable: true, createdAt: '2024-06-18T14:05:00Z' },
  { id: uuid(), restaurantId: RESTAURANTS[0].id, name: 'Olive Oil Cake', description: 'Citrus curd, basil sorbet.', category: 'DESSERT', price: 16, imageUrl: FOOD_IMG('148847890864'), isAvailable: true, createdAt: '2024-02-06T09:10:00Z' },
];

export const SEED_USERS: (User & { password: string })[] = [
  { id: uuid(), name: 'Elena Mercer', email: 'admin@aurelia.com', phone: '+1 415 555 0117', role: 'ADMIN', avatarUrl: AVATAR('elena'), password: 'admin123', createdAt: '2024-01-01T00:00:00Z' },
  { id: uuid(), name: 'Marco Diaz', email: 'manager@aurelia.com', phone: '+34 600 555 221', role: 'MANAGER', avatarUrl: AVATAR('marco'), password: 'manager123', createdAt: '2024-01-05T00:00:00Z' },
  { id: uuid(), name: 'Aiko Tanaka', email: 'customer@aurelia.com', phone: '+81 90 5555 7788', role: 'CUSTOMER', avatarUrl: AVATAR('aiko'), password: 'customer123', createdAt: '2024-02-10T00:00:00Z' },
];

export const REVIEWS: Review[] = [
  { id: uuid(), hotelId: HOTELS[0].id, userId: SEED_USERS[2].id, authorName: 'Aiko Tanaka', authorAvatarUrl: AVATAR('aiko'), rating: 5, comment: 'Flawless sea-view suite and the marina concierge anticipated every request.', status: 'PUBLISHED', createdAt: '2025-07-01T10:20:00Z' },
  { id: uuid(), hotelId: HOTELS[1].id, userId: SEED_USERS[1].id, authorName: 'Marco Diaz', authorAvatarUrl: AVATAR('marco'), rating: 5, comment: 'The infinity suite is unreal at sunset. Service was beyond attentive.', status: 'PUBLISHED', createdAt: '2025-07-04T15:10:00Z' },
  { id: uuid(), hotelId: HOTELS[2].id, userId: SEED_USERS[0].id, authorName: 'Elena Mercer', authorAvatarUrl: AVATAR('elena'), rating: 4, comment: 'Slopeside convenience and a wonderful sauna. Dining could expand.', status: 'PUBLISHED', createdAt: '2025-06-22T19:00:00Z' },
  { id: uuid(), hotelId: HOTELS[3].id, userId: SEED_USERS[2].id, authorName: 'Aiko Tanaka', authorAvatarUrl: AVATAR('aiko'), rating: 5, comment: 'The riad garden at dusk is magical. Hammam was a highlight.', status: 'PUBLISHED', createdAt: '2025-06-30T21:15:00Z' },
  { id: uuid(), hotelId: HOTELS[4].id, userId: SEED_USERS[1].id, authorName: 'Marco Diaz', authorAvatarUrl: AVATAR('marco'), rating: 5, comment: 'Kaiseki was a once-in-a-lifetime meal. Onsen suite perfection.', status: 'PUBLISHED', createdAt: '2025-07-09T08:40:00Z' },
  { id: uuid(), hotelId: HOTELS[5].id, userId: SEED_USERS[0].id, authorName: 'Elena Mercer', authorAvatarUrl: AVATAR('elena'), rating: 4, comment: 'Great Midtown location and club floor. A touch noisy on lower floors.', status: 'PUBLISHED', createdAt: '2025-06-28T13:55:00Z' },
];

export const BOOKINGS: Booking[] = [
  { id: uuid(), reference: 'AUR-2041', hotelId: HOTELS[0].id, roomId: ROOMS[1].id, roomTypeId: ROOM_TYPES[0].id, userId: SEED_USERS[2].id, guestName: 'Aiko Tanaka', guestEmail: 'customer@aurelia.com', checkIn: '2025-07-10', checkOut: '2025-07-14', nights: 4, guests: 2, status: 'CHECKED_IN', totalAmount: 1280, notes: 'Anniversary stay', createdAt: '2025-06-25T11:00:00Z', updatedAt: '2025-07-10T14:00:00Z' },
  { id: uuid(), reference: 'AUR-2042', hotelId: HOTELS[1].id, roomId: ROOMS[4].id, roomTypeId: ROOM_TYPES[2].id, userId: SEED_USERS[1].id, guestName: 'Marco Diaz', guestEmail: 'manager@aurelia.com', checkIn: '2025-07-16', checkOut: '2025-07-19', nights: 3, guests: 2, status: 'CONFIRMED', totalAmount: 2160, createdAt: '2025-07-02T09:30:00Z', updatedAt: '2025-07-02T09:30:00Z' },
  { id: uuid(), reference: 'AUR-2043', hotelId: HOTELS[4].id, roomId: ROOMS[9].id, roomTypeId: ROOM_TYPES[5].id, userId: SEED_USERS[2].id, guestName: 'Aiko Tanaka', guestEmail: 'customer@aurelia.com', checkIn: '2025-07-20', checkOut: '2025-07-24', nights: 4, guests: 2, status: 'PENDING', totalAmount: 2720, createdAt: '2025-07-12T16:20:00Z', updatedAt: '2025-07-12T16:20:00Z' },
  { id: uuid(), reference: 'AUR-2044', hotelId: HOTELS[5].id, roomId: ROOMS[11].id, roomTypeId: ROOM_TYPES[6].id, userId: SEED_USERS[0].id, guestName: 'Elena Mercer', guestEmail: 'admin@aurelia.com', checkIn: '2025-07-05', checkOut: '2025-07-08', nights: 3, guests: 1, status: 'CHECKED_OUT', totalAmount: 1170, createdAt: '2025-06-20T10:00:00Z', updatedAt: '2025-07-08T11:00:00Z' },
  { id: uuid(), reference: 'AUR-2045', hotelId: HOTELS[2].id, roomId: ROOMS[6].id, roomTypeId: ROOM_TYPES[3].id, userId: SEED_USERS[1].id, guestName: 'Marco Diaz', guestEmail: 'manager@aurelia.com', checkIn: '2025-07-22', checkOut: '2025-07-27', nights: 5, guests: 4, status: 'PENDING', totalAmount: 3050, createdAt: '2025-07-14T08:45:00Z', updatedAt: '2025-07-14T08:45:00Z' },
  { id: uuid(), reference: 'AUR-2046', hotelId: HOTELS[3].id, roomId: ROOMS[8].id, roomTypeId: ROOM_TYPES[4].id, userId: SEED_USERS[2].id, guestName: 'Aiko Tanaka', guestEmail: 'customer@aurelia.com', checkIn: '2025-07-15', checkOut: '2025-07-18', nights: 3, guests: 2, status: 'CANCELLED', totalAmount: 840, createdAt: '2025-07-01T12:00:00Z', updatedAt: '2025-07-03T18:00:00Z' },
];

export const ACTIVITIES: Activity[] = [
  { id: uuid(), type: 'CHECK_IN', title: 'Guest checked in', description: 'Aiko Tanaka · Aurelia Grand Riviera · Room 102', actor: 'Marco Diaz', timestamp: '2025-07-10T14:00:00Z' },
  { id: uuid(), type: 'BOOKING', title: 'New booking placed', description: 'AUR-2043 · Aurelia Kyoto Gardens · 4 nights', actor: 'Aiko Tanaka', timestamp: '2025-07-12T16:20:00Z' },
  { id: uuid(), type: 'REVIEW', title: 'New 5-star review', description: 'Aurelia Kyoto Gardens — "Kaiseki was a once-in-a-lifetime meal."', actor: 'Marco Diaz', timestamp: '2025-07-09T08:40:00Z' },
  { id: uuid(), type: 'CHECK_OUT', title: 'Guest checked out', description: 'Elena Mercer · Aurelia Manhattan Towers', actor: 'System', timestamp: '2025-07-08T11:00:00Z' },
  { id: uuid(), type: 'CANCEL', title: 'Booking cancelled', description: 'AUR-2046 · Aurelia Marrakech Palais', actor: 'Aiko Tanaka', timestamp: '2025-07-03T18:00:00Z' },
  { id: uuid(), type: 'BOOKING', title: 'New booking placed', description: 'AUR-2045 · Aurelia Alpine Lodge · 5 nights', actor: 'Marco Diaz', timestamp: '2025-07-14T08:45:00Z' },
];

/** Sync clones — services mutate these copies to simulate persistence across the session. */
export const db = {
  hotels: structuredClone(HOTELS),
  roomTypes: structuredClone(ROOM_TYPES),
  rooms: structuredClone(ROOMS),
  restaurants: structuredClone(RESTAURANTS),
  menuItems: structuredClone(MENU_ITEMS),
  reviews: structuredClone(REVIEWS),
  bookings: structuredClone(BOOKINGS),
  users: structuredClone(SEED_USERS),
  activities: structuredClone(ACTIVITIES),
};
