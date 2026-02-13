import { Offer } from '@shared/data-access/models/offer.model';

const _categories = ['Electronics', 'Audio', 'Gaming', 'Computers', 'Cameras', 'Wearables', 'Home'];
const conditions: ('like-new' | 'good' | 'fair')[] = ['like-new', 'good', 'fair'];
const sellers = ['TechDeals', 'AppleRefurb', 'AudioPro', 'GamerHub', 'PhotoExperts', 'SmartHome'];

const products = [
  {
    name: 'iPhone 15 Pro Max',
    price: 1199,
    category: 'Electronics',
    image: 'photo-1632661674596-df8be070a5c5',
  },
  {
    name: 'MacBook Pro 16" M3',
    price: 2499,
    category: 'Computers',
    image: 'photo-1517336714731-489689fd1ca8',
  },
  {
    name: 'Sony WH-1000XM5',
    price: 349,
    category: 'Audio',
    image: 'photo-1546435770-a3e426bf472b',
  },
  {
    name: 'iPad Air M2',
    price: 699,
    category: 'Electronics',
    image: 'photo-1544244015-0df4b3ffc6b0',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: 1099,
    category: 'Electronics',
    image: 'photo-1610945415295-d9bbf067e59c',
  },
  {
    name: 'PlayStation 5 Digital',
    price: 449,
    category: 'Gaming',
    image: 'photo-1606813907291-d86efa9b94db',
  },
  {
    name: 'Xbox Series X',
    price: 499,
    category: 'Gaming',
    image: 'photo-1621259182978-fbf93132d53d',
  },
  {
    name: 'Nintendo Switch OLED',
    price: 349,
    category: 'Gaming',
    image: 'photo-1578303512597-81e6cc155b3e',
  },
  {
    name: 'AirPods Pro 2nd Gen',
    price: 249,
    category: 'Audio',
    image: 'photo-1606841837239-c5a1a4a07af7',
  },
  {
    name: 'Canon EOS R6 Mark II',
    price: 2499,
    category: 'Cameras',
    image: 'photo-1606980707965-73c3f8e5e929',
  },
  {
    name: 'Sony A7 IV',
    price: 2299,
    category: 'Cameras',
    image: 'photo-1516035069371-29a1b244cc32',
  },
  {
    name: 'Apple Watch Series 9',
    price: 429,
    category: 'Wearables',
    image: 'photo-1434494878577-86c23bcb06b9',
  },
  {
    name: 'Samsung Galaxy Watch 6',
    price: 299,
    category: 'Wearables',
    image: 'photo-1579586337278-3befd40fd17a',
  },
  {
    name: 'Bose QuietComfort Ultra',
    price: 379,
    category: 'Audio',
    image: 'photo-1599669454699-248893623440',
  },
  {
    name: 'Dell XPS 15',
    price: 1799,
    category: 'Computers',
    image: 'photo-1593642632823-8f785ba67e45',
  },
  {
    name: 'LG C3 OLED 65"',
    price: 1999,
    category: 'Home',
    image: 'photo-1593359677879-a4bb92f829d1',
  },
  {
    name: 'Dyson V15 Detect',
    price: 649,
    category: 'Home',
    image: 'photo-1558317374-067fb5f30001',
  },
  {
    name: 'Google Pixel 8 Pro',
    price: 999,
    category: 'Electronics',
    image: 'photo-1598327105666-5b89351aff97',
  },
  {
    name: 'Surface Pro 9',
    price: 1299,
    category: 'Computers',
    image: 'photo-1617817546183-fcd502c83c23',
  },
  {
    name: 'Kindle Paperwhite',
    price: 139,
    category: 'Electronics',
    image: 'photo-1592503254549-d83d24a4dfab',
  },
  {
    name: 'GoPro Hero 12',
    price: 399,
    category: 'Cameras',
    image: 'photo-1606933248010-ef1f8d99c2d9',
  },
  {
    name: 'Sonos Arc Soundbar',
    price: 899,
    category: 'Audio',
    image: 'photo-1545454675-3531b543be5d',
  },
  {
    name: 'DJI Mini 4 Pro Drone',
    price: 759,
    category: 'Cameras',
    image: 'photo-1507582020474-9a35b7d455d9',
  },
  {
    name: 'Fitbit Charge 6',
    price: 159,
    category: 'Wearables',
    image: 'photo-1575311373937-040b8e1fd5b6',
  },
  {
    name: 'Meta Quest 3',
    price: 499,
    category: 'Gaming',
    image: 'photo-1622979135225-d2ba269cf1ac',
  },
];

export function generateMockOffers(count = 50): Offer[] {
  const offers: Offer[] = [];

  for (let i = 0; i < count; i++) {
    const product = products[i % products.length];
    const id = String(i + 1);
    const variance = 0.7 + Math.random() * 0.6; // 70% to 130% of base price
    const price = Math.round(product.price * variance * 100) / 100;
    const votes = Math.floor(Math.random() * 100);
    const daysAgo = Math.floor(Math.random() * 30);

    offers.push({
      id,
      title: `${product.name} ${i > products.length ? `(${Math.floor(i / products.length) * 50}GB)` : ''}`,
      description: `High-quality ${product.name} in excellent condition. ${
        i % 3 === 0
          ? 'Includes original box and accessories.'
          : i % 3 === 1
            ? 'Well maintained, barely used.'
            : 'Great deal for this premium item.'
      }`,
      price,
      currency: 'EUR',
      imageUrl: `https://images.unsplash.com/${product.image}?w=800&q=80`,
      votes,
      category: product.category,
      seller: sellers[i % sellers.length],
      condition: conditions[i % conditions.length],
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  return offers;
}

export const MOCK_OFFERS_DATA = generateMockOffers(50);
