export interface Hotel {
  id: string;
  name: string;
  location: string;
  image: string;
  guestRating: number;
  hotelRating: number;
  price: number;
  originalPrice?: number;
  roomsLeft?: number;
  distance: string;
  driveTime: string;
  amenities: string[];
  badges: string[];
  isHostHotel?: boolean;
  isStaffOnly?: boolean;
  mapPosition: { x: number; y: number };
}

export const hotels: Hotel[] = [
  {
    id: "1",
    name: "Holiday Inn Express & Suites",
    location: "Sarnia, ON",
    image: "https://images.unsplash.com/photo-1771293549382-62829fad8f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yJTIwbW9kZXJufGVufDF8fHx8MTc3MjM4NTg4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 9.2,
    hotelRating: 3.5,
    price: 235,
    roomsLeft: 25,
    distance: "0.9 mi",
    driveTime: "23 mins",
    amenities: ["breakfast", "parking", "wifi", "pool"],
    badges: ["2 night minimum"],
    mapPosition: { x: 35, y: 25 },
  },
  {
    id: "2",
    name: "Best Western Plus & Conference",
    location: "Sarnia, ON",
    image: "https://images.unsplash.com/photo-1771206331424-44b8ec9acdf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGxvYmJ5JTIwZWxlZ2FudCUyMGludGVyaW9yfGVufDF8fHx8MTc3MjM5NTcyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 9.2,
    hotelRating: 3,
    price: 200,
    roomsLeft: undefined,
    distance: "0.9 mi",
    driveTime: "23 mins",
    amenities: ["breakfast", "parking", "wifi"],
    badges: [],
    isStaffOnly: true,
    mapPosition: { x: 55, y: 45 },
  },
  {
    id: "3",
    name: "Lambton Inn on the River",
    location: "Sarnia, ON",
    image: "https://images.unsplash.com/photo-1761757821641-3b347c034042?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbSUyMGNvenl8ZW58MXx8fHwxNzcyNDUxNTgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 8.8,
    hotelRating: 4,
    price: 140,
    originalPrice: 175,
    roomsLeft: 8,
    distance: "1.2 mi",
    driveTime: "18 mins",
    amenities: ["wifi", "parking", "pool"],
    badges: ["Best deal"],
    isHostHotel: true,
    mapPosition: { x: 72, y: 55 },
  },
  {
    id: "4",
    name: "Fairfield Inn & Suites by Marriott",
    location: "Sarnia, ON",
    image: "https://images.unsplash.com/photo-1743525922686-badbeac16a34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNvcnQlMjBwb29sJTIwdHJvcGljYWwlMjBob3RlbHxlbnwxfHx8fDE3NzI0NjcxMzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 8.5,
    hotelRating: 3,
    price: 180,
    roomsLeft: 12,
    distance: "2.1 mi",
    driveTime: "28 mins",
    amenities: ["breakfast", "wifi", "pool"],
    badges: [],
    mapPosition: { x: 45, y: 70 },
  },
  {
    id: "5",
    name: "Point Edward Casino Resort",
    location: "Point Edward, ON",
    image: "https://images.unsplash.com/photo-1694595437436-2ccf5a95591f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMGJ1aWxkaW5nJTIwY2l0eXxlbnwxfHx8fDE3NzI0NjcxMzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 9.0,
    hotelRating: 4.5,
    price: 375,
    roomsLeft: 5,
    distance: "3.4 mi",
    driveTime: "32 mins",
    amenities: ["breakfast", "parking", "wifi", "pool"],
    badges: ["Premium"],
    mapPosition: { x: 80, y: 20 },
  },
  {
    id: "6",
    name: "Comfort Inn Sarnia",
    location: "Sarnia, ON",
    image: "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHN1aXRlJTIwYmVkcm9vbSUyMHByZW1pdW18ZW58MXx8fHwxNzcyNDY3MTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 7.8,
    hotelRating: 2.5,
    price: 250,
    roomsLeft: 30,
    distance: "1.8 mi",
    driveTime: "25 mins",
    amenities: ["breakfast", "wifi"],
    badges: [],
    mapPosition: { x: 20, y: 60 },
  },
  {
    id: "7",
    name: "Quality Suites Downtown",
    location: "Sarnia, ON",
    image: "https://images.unsplash.com/photo-1669131196150-97b7a0707f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3dudG93biUyMGhvdGVsJTIwdXJiYW4lMjBuaWdodHxlbnwxfHx8fDE3NzI0NjcxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 8.1,
    hotelRating: 3,
    price: 200,
    roomsLeft: 18,
    distance: "0.5 mi",
    driveTime: "12 mins",
    amenities: ["parking", "wifi"],
    badges: [],
    mapPosition: { x: 30, y: 40 },
  },
  {
    id: "8",
    name: "Waterfront Hotel & Spa",
    location: "Sarnia, ON",
    image: "https://images.unsplash.com/photo-1715322001435-0954aa0ff87c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMGhvdGVsJTIwb2NlYW58ZW58MXx8fHwxNzcyNDY3MTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    guestRating: 9.4,
    hotelRating: 4,
    price: 400,
    roomsLeft: 3,
    distance: "2.8 mi",
    driveTime: "30 mins",
    amenities: ["breakfast", "parking", "wifi", "pool"],
    badges: ["Luxury pick"],
    mapPosition: { x: 65, y: 80 },
  },
];