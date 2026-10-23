export type RoomCategory = "vip" | "big" | "medium";

export type Room = {
  id: number;
  name: string;
  slug: string;
  category: RoomCategory;
  categoryLabel: string;
  baseRateKobo: number;
  vatKobo: number;
  totalRateKobo: number;
  image: string;
  shortDescription: string;
};

export const rooms: Room[] = [
  {
    id: 1,
    name: "Nigeria",
    slug: "nigeria",
    category: "vip",
    categoryLabel: "VIP",
    baseRateKobo: 7000000,
    vatKobo: 525000,
    totalRateKobo: 7525000,
    image: "/images/rooms/nigeria.jpeg",
    shortDescription:
      "A spacious VIP room offering elevated comfort and a relaxing stay.",
  },
  {
    id: 2,
    name: "Morocco",
    slug: "morocco",
    category: "big",
    categoryLabel: "VIP",
    baseRateKobo: 5500000,
    vatKobo: 412500,
    totalRateKobo: 5912500,
    image: "/images/rooms/morocco.jpeg",
    shortDescription:
      "A spacious VIP room offering elevated comfort and a relaxing stay.",
  },
  {
    id: 3,
    name: "Ghana",
    slug: "ghana",
    category: "big",
    categoryLabel: "Big Room",
    baseRateKobo: 5500000,
    vatKobo: 412500,
    totalRateKobo: 5912500,
    image: "/images/rooms/ghana.jpeg",
    shortDescription:
      "A generous Big Room designed for comfort, space and relaxation.",
  },
  {
    id: 4,
    name: "Kenya",
    slug: "kenya",
    category: "big",
    categoryLabel: "Big Room",
    baseRateKobo: 5500000,
    vatKobo: 412500,
    totalRateKobo: 5912500,
    image: "/images/rooms/kenya.jpeg",
    shortDescription:
      "A generous Big Room designed for comfort, space and relaxation.",
  },
  {
    id: 5,
    name: "Rwanda",
    slug: "rwanda",
    category: "vip",
    categoryLabel: "Big Room",
    baseRateKobo: 7000000,
    vatKobo: 525000,
    totalRateKobo: 7525000,
    image: "/images/rooms/rwanda.jpeg",
    shortDescription:
      "A generous Big Room designed for comfort, space and relaxation.",
  },
  {
    id: 6,
    name: "Egypt",
    slug: "egypt",
    category: "medium",
    categoryLabel: "Medium",
    baseRateKobo: 5000000,
    vatKobo: 375000,
    totalRateKobo: 5375000,
    image: "/images/rooms/egypt.jpeg",
    shortDescription:
      "A comfortable Medium Room with everything needed for an enjoyable stay.",
  },
  {
    id: 7,
    name: "Mozambique",
    slug: "mozambique",
    category: "medium",
    categoryLabel: "Medium",
    baseRateKobo: 5000000,
    vatKobo: 375000,
    totalRateKobo: 5375000,
    image: "/images/rooms/mozambique.jpeg",
    shortDescription:
      "A comfortable Medium Room with everything needed for an enjoyable stay.",
  },
  {
    id: 8,
    name: "Botswana",
    slug: "botswana",
    category: "medium",
    categoryLabel: "Medium",
    baseRateKobo: 5000000,
    vatKobo: 375000,
    totalRateKobo: 5375000,
    image: "/images/rooms/botswana.jpeg",
    shortDescription:
      "A comfortable Medium Room with everything needed for an enjoyable stay.",
  },
];

export function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug);
}
