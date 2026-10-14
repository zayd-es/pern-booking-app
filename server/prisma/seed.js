// by claude: demo data (hotels + rooms with photos) to test the app.
// Run:   npm run seed             -> add the demo data (re-running only updates / adds what is missing)
//        npm run seed -- --clear  -> remove the demo data (also deletes the bookings made on demo hotels)
// Everything created here belongs to fake users whose id starts with "seed_",
// so your real account/data is never touched.
import prisma from "../configs/prisma.js";

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const ROOM_PHOTOS = [
  "1611892440504-42a792e24d32",
  "1582719478250-c89cae4dc85b",
  "1590490360182-c33d57733427",
  "1566665797739-1674de7a421a",
  "1618773928121-c32242e63f39",
  "1631049307264-da0ec9d70304",
  "1595576508898-0ad5c879a061",
  "1578683010236-d716f9a3f461",
  "1540518614846-7eded433c457",
  "1505693416388-ac5ce068fe85",
  "1560185007-cde436f6a4d0",
  "1615873968403-89e068629265",
  "1596394516093-501ba68a0ba6",
  "1578898886225-c7c894047899",
];
const HOTEL_PHOTOS = [
  "1564501049412-61c2a3083791",
  "1542314831-068cd1dbfeeb",
  "1551882547-ff40c63fe5fa",
  "1520250497591-112f2f40a3f4",
  "1571896349842-33c89424de2d",
  "1584132967334-10e028bd69f7",
  "1560448204-e02f11c3d0e2",
  "1445019980597-93fa8acb246c",
  "1566073771259-6a8506099945",
];

// 3 photos per room: a room shot, a hotel shot, another room shot (rotating so rooms differ)
let n = 0;
const photos = () => {
  const i = n++;
  return [
    img(ROOM_PHOTOS[i % ROOM_PHOTOS.length]),
    img(HOTEL_PHOTOS[i % HOTEL_PHOTOS.length]),
    img(ROOM_PHOTOS[(i + 5) % ROOM_PHOTOS.length]),
  ];
};

const WIFI = "Free WiFi";
const BREAKFAST = "Free Breakfast";
const SERVICE = "Room Service";
const MOUNTAIN = "Mountain View";
const POOL = "Pool Access";

const HOTELS = [
  {
    name: "Riad Al Jawhara",
    city: "Marrakech",
    address: "12 Derb Sidi Bouamar, Medina",
    contact: "+212 524 123 456",
    description: "Nestled in the heart of the Medina, this traditional riad blends Moroccan craftsmanship with modern comfort. Relax around the central courtyard fountain, enjoy a homemade breakfast on the rooftop terrace and explore Jemaa el-Fnaa on foot.",
    rooms: [
      ["Luxury Room", 220, "A sumptuous riad suite with zellige tiles, a carved cedar ceiling and a private view of the central courtyard fountain.", [WIFI, BREAKFAST, SERVICE, POOL]],
      ["Double Bed", 130, "Cosy double room around the patio, with traditional Moroccan decor and a rain shower.", [WIFI, BREAKFAST]],
      ["Family Suite", 290, "Two connected bedrooms, a lounge corner and a terrace overlooking the rooftops of the Medina.", [WIFI, BREAKFAST, SERVICE, POOL]],
    ],
  },
  {
    name: "Atlas Panorama Hotel",
    city: "Ifrane",
    address: "Avenue Hassan II",
    contact: "+212 535 556 677",
    description: "Surrounded by cedar forests and the Middle Atlas mountains, this peaceful hotel offers warm hospitality, panoramic views and cosy fireplaces. A perfect base for hiking, skiing in winter and discovering Berber culture.",
    rooms: [
      ["Double Bed", 110, "Bright room with large windows facing the cedar forest of the Middle Atlas.", [WIFI, MOUNTAIN]],
      ["Luxury Room", 240, "Spacious suite with fireplace, king bed and a panoramic mountain view.", [WIFI, BREAKFAST, MOUNTAIN]],
    ],
  },
  {
    name: "Blue Pearl Resort",
    city: "Agadir",
    address: "Boulevard du 20 Aout, Corniche",
    contact: "+212 528 840 001",
    description: "Just steps from the beach, our resort offers bright, comfortable rooms with sea views, a large pool and a sunny terrace. Perfect for families and couples looking for a relaxing stay by the Atlantic.",
    rooms: [
      ["Luxury Room", 260, "Sea-facing suite steps from the beach, with a balcony and direct access to the pool.", [WIFI, BREAKFAST, SERVICE, POOL]],
      ["Family Suite", 340, "Large family suite with two bedrooms, kitchenette and a terrace over the pool.", [WIFI, BREAKFAST, POOL]],
      ["Single Bed", 75, "Compact and comfortable single room, ideal for solo travellers, 5 minutes from the beach.", [WIFI]],
    ],
  },
  {
    name: "Medina Palace Fes",
    city: "Fes",
    address: "7 Talaa Kebira, Fes el-Bali",
    contact: "+212 535 634 120",
    description: "A restored palace in the old medina of Fes, with painted wood ceilings, antique furniture and a quiet courtyard. Walk to the tanneries, the Al Quaraouiyine and the souks, then unwind with mint tea on the terrace.",
    rooms: [
      ["Luxury Room", 200, "Historic palace room with painted wood ceiling, antique furniture and modern comfort.", [WIFI, BREAKFAST, SERVICE]],
      ["Double Bed", 95, "Charming double room with a view over the old Medina rooftops.", [WIFI, BREAKFAST]],
    ],
  },
  {
    name: "Ocean Breeze Boutique",
    city: "Essaouira",
    address: "5 Rue de la Skala",
    contact: "+212 524 783 305",
    description: "A small boutique hotel inside the walls of Essaouira, a few steps from the ramparts and the fishing port. Light-filled rooms, a roof terrace with ocean views and breakfast made with local produce.",
    rooms: [
      ["Double Bed", 105, "Whitewashed room with blue shutters, a few steps from the ramparts and the port.", [WIFI, BREAKFAST]],
      ["Single Bed", 65, "Simple, light-filled room with fresh sea air and breakfast on the roof terrace.", [WIFI, BREAKFAST]],
      ["Luxury Room", 185, "Top-floor suite with ocean view, freestanding bath and a private terrace.", [WIFI, BREAKFAST, SERVICE]],
    ],
  },
  {
    name: "Casablanca Grand Hotel",
    city: "Casablanca",
    address: "Boulevard d'Anfa",
    contact: "+212 522 270 800",
    description: "A modern city hotel on Boulevard d'Anfa, close to the Hassan II Mosque and the business district. Spacious rooms, fast WiFi, 24/7 room service and a rooftop pool make it ideal for business and leisure.",
    rooms: [
      ["Luxury Room", 280, "Modern business suite on a high floor with skyline view, workspace and 24/7 room service.", [WIFI, BREAKFAST, SERVICE, POOL]],
      ["Double Bed", 140, "Elegant double room in the heart of the city, close to the Hassan II Mosque.", [WIFI, SERVICE]],
      ["Family Suite", 320, "Two-bedroom suite with living area, ideal for families visiting the coast.", [WIFI, BREAKFAST, SERVICE]],
    ],
  },
  {
    name: "Blue City Guesthouse",
    city: "Chefchaouen",
    address: "Rue Targui, Medina",
    contact: "+212 539 986 410",
    description: "A friendly guesthouse in the blue-washed medina of Chefchaouen. Handmade textiles, mountain views from the terrace and a homemade breakfast, in one of the most photogenic towns in Morocco.",
    rooms: [
      ["Double Bed", 70, "Blue-washed room with handmade textiles and a view over the blue medina.", [WIFI, BREAKFAST, MOUNTAIN]],
      ["Family Suite", 150, "Spacious room for 4 with terrace and mountain view of the Rif.", [WIFI, BREAKFAST, MOUNTAIN]],
    ],
  },
  {
    name: "Sahara Dunes Camp",
    city: "Merzouga",
    address: "Erg Chebbi, Merzouga",
    contact: "+212 535 577 912",
    description: "Sleep under the stars in the golden dunes of Erg Chebbi. Comfortable desert tents with real beds, traditional Berber dinners, camel treks at sunset and an unforgettable sunrise over the Sahara.",
    rooms: [
      ["Luxury Room", 195, "Luxury desert tent with king bed, private bathroom and a sunset view over the dunes.", [BREAKFAST, SERVICE]],
      ["Double Bed", 120, "Comfortable tent suite with traditional Berber decor, dinner under the stars included.", [BREAKFAST]],
    ],
  },
  {
    name: "Tangier Bay View",
    city: "Tangier",
    address: "Avenue des FAR",
    contact: "+212 539 937 700",
    description: "Overlooking the bay and the Strait of Gibraltar, this hotel combines a relaxed seaside atmosphere with easy access to the medina, the kasbah and the beaches of Tangier.",
    rooms: [
      ["Double Bed", 115, "Bright room overlooking the bay and the Strait of Gibraltar.", [WIFI, BREAKFAST]],
      ["Luxury Room", 230, "Corner suite with floor-to-ceiling windows and views to Spain on clear days.", [WIFI, BREAKFAST, SERVICE, POOL]],
    ],
  },
  {
    name: "Rabat Garden Hotel",
    city: "Rabat",
    address: "Avenue Mohammed V",
    contact: "+212 537 706 262",
    description: "A calm hotel in the capital, surrounded by gardens and minutes from the Kasbah of the Udayas and the Hassan Tower. Comfortable rooms and a friendly welcome in the heart of Rabat.",
    rooms: [
      ["Single Bed", 80, "Quiet single room facing the garden, minutes from the Kasbah of the Udayas.", [WIFI, BREAKFAST]],
      ["Double Bed", 125, "Comfortable double room with city view and complimentary breakfast.", [WIFI, BREAKFAST, SERVICE]],
    ],
  },
];

const clear = async () => {
  const seedHotels = await prisma.hotel.findMany({
    where: { ownerId: { startsWith: "seed_" } },
    select: { id: true },
  });
  const ids = seedHotels.map((h) => h.id);
  await prisma.booking.deleteMany({ where: { hotelId: { in: ids } } });
  // hotels + rooms are removed by cascade when the fake owners are deleted
  const { count } = await prisma.user.deleteMany({
    where: { id: { startsWith: "seed_" } },
  });
  return count;
};

const main = async () => {
  if (process.argv.includes("--clear")) {
    const removed = await clear();
    console.log(`Removed demo data (${removed} fake owners)`);
    return;
  }

  // by claude: safe to re-run. Existing demo hotels are UPDATED (details + description),
  // missing ones are created. Rooms and bookings of existing hotels are never touched.
  for (const [i, h] of HOTELS.entries()) {
    const ownerId = `seed_owner_${i + 1}`;
    const owner = await prisma.user.upsert({
      where: { id: ownerId },
      update: {},
      create: {
        id: ownerId,
        username: `${h.name} Manager`,
        email: `seed.owner${i + 1}@example.com`,
        image: `https://i.pravatar.cc/150?img=${i + 10}`,
        role: "hotelOwner",
      },
    });

    const existing = await prisma.hotel.findFirst({ where: { ownerId: owner.id } });
    const details = {
      name: h.name,
      address: h.address,
      contact: h.contact,
      description: h.description,
      city: h.city,
      country: "Morocco",
    };

    if (existing) {
      await prisma.hotel.update({ where: { id: existing.id }, data: details });
      console.log(`~ updated ${h.name}`);
    } else {
      await prisma.hotel.create({
        data: {
          ...details,
          ownerId: owner.id,
          rooms: {
            create: h.rooms.map(([roomType, pricePerNight, description, amenities]) => ({
              roomType,
              pricePerNight,
              description,
              amenities,
              images: photos(),
            })),
          },
        },
      });
      console.log(`+ created ${h.name} (${h.city}) - ${h.rooms.length} rooms`);
    }
  }
  console.log("Done.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
