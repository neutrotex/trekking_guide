import { NextResponse } from 'next/server';
import TrekModel from '@/models/Trek';
import GuideModel from '@/models/Guide';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';

export async function POST() {
  try {
    await connectDB();
    // Clear existing data
    await TrekModel.deleteMany({});
    await GuideModel.deleteMany({});
    await UserModel.deleteMany({});

    // Create sample users first
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const sampleUsers = [
      {
        name: 'Tenzing Sherpa',
        email: 'tenzing@example.com',
        password: hashedPassword,
        role: 'guide',
      },
      {
        name: 'Suman Tamang',
        email: 'suman@example.com',
        password: hashedPassword,
        role: 'guide',
      },
      {
        name: 'Raj Gurung',
        email: 'raj@example.com',
        password: hashedPassword,
        role: 'guide',
      },
      {
        name: 'Maya Ghale',
        email: 'maya@example.com',
        password: hashedPassword,
        role: 'guide',
      },
      {
        name: 'Dawa Sherpa',
        email: 'dawa@example.com',
        password: hashedPassword,
        role: 'guide',
      },
    ];

    const users = await UserModel.insertMany(sampleUsers);

    // Add multiple treks with detailed information for better map visualization
    const sampleTreks = [
      {
        name: 'Annapurna Circuit Trek',
        description: 'The Annapurna Circuit is one of Nepal\'s most popular treks, offering incredible diversity in landscapes, cultures, and climates. This classic trek takes you around the entire Annapurna massif, passing through subtropical valleys, alpine forests, and high-altitude desert landscapes. The trek reaches its highest point at Thorong La Pass (5,416m) and offers spectacular views of Annapurna I (8,091m), Dhaulagiri (8,167m), and other towering peaks. The route passes through traditional Gurung, Thakali, and Manangi villages, providing rich cultural experiences alongside breathtaking natural beauty.',
        difficulty: 'moderate',
        duration: '12-15 days',
        maxAltitude: '5,416m (Thorong La Pass)',
        bestSeason: 'October-November, March-May',
        highlights: [
          'Thorong La Pass crossing',
          'Muktinath Temple',
          'Manang village',
          'Poon Hill sunrise views',
          'Natural hot springs at Tatopani'
        ],
        shops: [
          { name: 'Pokhara Adventure Gear', lat: 28.2096, lng: 83.9856, description: 'Complete trekking equipment and supplies' },
          { name: 'Besisahar Market', lat: 28.2333, lng: 84.3833, description: 'Local market for fresh supplies' },
          { name: 'Chame General Store', lat: 28.5500, lng: 84.2333, description: 'Basic supplies and snacks' },
          { name: 'Manang Trading Post', lat: 28.6667, lng: 84.0167, description: 'Last major supply point before Thorong La' },
          { name: 'Muktinath Shop', lat: 28.8167, lng: 83.8667, description: 'Post-pass supplies and souvenirs' },
          { name: 'Jomsom Equipment', lat: 28.7833, lng: 83.7167, description: 'Gear repair and additional supplies' },
          { name: 'Tatopani Hot Springs Shop', lat: 28.6000, lng: 83.5500, description: 'Relaxation supplies and snacks' }
        ],
        wastePoints: [
          { lat: 28.2333, lng: 84.3833, description: 'Besisahar waste collection point' },
          { lat: 28.5500, lng: 84.2333, description: 'Chame waste disposal facility' },
          { lat: 28.6667, lng: 84.0167, description: 'Manang waste management center' },
          { lat: 28.8167, lng: 83.8667, description: 'Muktinath waste collection' },
          { lat: 28.7833, lng: 83.7167, description: 'Jomsom waste disposal point' },
          { lat: 28.6000, lng: 83.5500, description: 'Tatopani waste management' }
        ],
        route: [
          { name: 'Pokhara', lat: 28.2096, lng: 83.9856, altitude: '822m' },
          { name: 'Besisahar', lat: 28.2333, lng: 84.3833, altitude: '760m' },
          { name: 'Ngadi', lat: 28.2800, lng: 84.3500, altitude: '890m' },
          { name: 'Jagat', lat: 28.3200, lng: 84.3000, altitude: '1,300m' },
          { name: 'Chamje', lat: 28.3800, lng: 84.2500, altitude: '1,410m' },
          { name: 'Tal', lat: 28.4200, lng: 84.2000, altitude: '1,700m' },
          { name: 'Dharapani', lat: 28.4800, lng: 84.1500, altitude: '1,860m' },
          { name: 'Bagarchhap', lat: 28.5100, lng: 84.1300, altitude: '2,160m' },
          { name: 'Chame', lat: 28.5500, lng: 84.2333, altitude: '2,670m' },
          { name: 'Pisang', lat: 28.6000, lng: 84.1500, altitude: '3,200m' },
          { name: 'Bragha', lat: 28.6300, lng: 84.1000, altitude: '3,450m' },
          { name: 'Manang', lat: 28.6667, lng: 84.0167, altitude: '3,540m' },
          { name: 'Yak Kharka', lat: 28.7000, lng: 83.9800, altitude: '4,018m' },
          { name: 'Thorong Phedi', lat: 28.7300, lng: 83.9600, altitude: '4,450m' },
          { name: 'Thorong La Pass', lat: 28.7500, lng: 83.9500, altitude: '5,416m' },
          { name: 'Muktinath', lat: 28.8167, lng: 83.8667, altitude: '3,800m' },
          { name: 'Kagbeni', lat: 28.8000, lng: 83.7500, altitude: '2,804m' },
          { name: 'Jomsom', lat: 28.7833, lng: 83.7167, altitude: '2,720m' },
          { name: 'Marpha', lat: 28.7500, lng: 83.6500, altitude: '2,670m' },
          { name: 'Tatopani', lat: 28.6000, lng: 83.5500, altitude: '1,190m' }
        ],
        photos: [
          { 
            url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            caption: 'Starting the journey from Pokhara - Beautiful lake city surrounded by mountains',
            routePointIndex: 0,
            routePointName: 'Pokhara'
          },
          { 
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            caption: 'Arriving at Besisahar - The gateway to Annapurna Circuit',
            routePointIndex: 1,
            routePointName: 'Besisahar'
          },
          { 
            url: 'https://images.unsplash.com/photo-1464822759844-d150ad2996de?w=800&q=80',
            caption: 'Trekking through the Marsyangdi Valley - Early stages of the circuit',
            routePointIndex: 3,
            routePointName: 'Jagat'
          },
          { 
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            caption: 'Passing through Chamje - Traditional villages along the trail',
            routePointIndex: 4,
            routePointName: 'Chamje'
          },
          { 
            url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
            caption: 'Reaching higher altitudes - Views of the valley from Tal',
            routePointIndex: 5,
            routePointName: 'Tal'
          },
          { 
            url: 'https://images.unsplash.com/photo-1464822759844-d150ad2996de?w=800&q=80',
            caption: 'Traditional Manangi architecture in Bagarchhap village',
            routePointIndex: 7,
            routePointName: 'Bagarchhap'
          },
          { 
            url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
            caption: 'Chame district - Beautiful views and warmer hospitality',
            routePointIndex: 8,
            routePointName: 'Chame'
          },
          { 
            url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            caption: 'Pisang village with stunning mountain backdrop',
            routePointIndex: 9,
            routePointName: 'Pisang'
          },
          { 
            url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80',
            caption: 'Manang - Acclimatization point before the high pass',
            routePointIndex: 11,
            routePointName: 'Manang'
          },
          { 
            url: 'https://images.unsplash.com/photo-1464822759844-d150ad2996de?w=800&q=80',
            caption: 'Yak Kharka - High altitude pastures and yaks grazing',
            routePointIndex: 12,
            routePointName: 'Yak Kharka'
          },
          { 
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            caption: 'Thorong Phedi base camp - Final stop before the pass',
            routePointIndex: 13,
            routePointName: 'Thorong Phedi'
          },
          { 
            url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80',
            caption: 'Thorong La Pass at 5,416m - The highest point of the circuit with breathtaking views',
            routePointIndex: 14,
            routePointName: 'Thorong La Pass'
          },
          { 
            url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            caption: 'Muktinath Temple - Sacred pilgrimage site after crossing the pass',
            routePointIndex: 15,
            routePointName: 'Muktinath'
          },
          { 
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            caption: 'Kagbeni village - Unique architecture and culture',
            routePointIndex: 16,
            routePointName: 'Kagbeni'
          },
          { 
            url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
            caption: 'Jomsom - Gateway to Upper Mustang and windy valley',
            routePointIndex: 17,
            routePointName: 'Jomsom'
          },
          { 
            url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
            caption: 'Marpha village - Famous for apple products and traditional architecture',
            routePointIndex: 18,
            routePointName: 'Marpha'
          },
          { 
            url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80',
            caption: 'Tatopani hot springs - Perfect way to relax after completing the circuit',
            routePointIndex: 19,
            routePointName: 'Tatopani'
          }
        ]
      },
      {
        name: 'Everest Base Camp Trek',
        description: 'Experience the ultimate adventure to the base of the world\'s highest mountain. This iconic 12-14 day trek offers breathtaking views of Everest and surrounding peaks, Sherpa culture immersion, and challenging high-altitude hiking through the Khumbu region.',
        difficulty: 'hard',
        duration: '12-14 days',
        maxAltitude: '5,364m (Everest Base Camp)',
        bestSeason: 'October-November, March-May',
        highlights: [
          'Everest Base Camp',
          'Kala Patthar viewpoint',
          'Namche Bazaar',
          'Tengboche Monastery',
          'Sherpa culture immersion'
        ],
        shops: [
          { name: 'Lukla Equipment Shop', lat: 27.6880, lng: 86.7312, description: 'Last chance for gear before trek' },
          { name: 'Namche Bazaar Market', lat: 27.8058, lng: 86.7108, description: 'Major supply point and acclimatization' },
          { name: 'Dingboche Provisions', lat: 27.9011, lng: 86.8362, description: 'High altitude supplies' },
          { name: 'Gorak Shep Shop', lat: 28.0026, lng: 86.8528, description: 'Final supplies before EBC' }
        ],
        wastePoints: [
          { lat: 27.6880, lng: 86.7312, description: 'Lukla waste management' },
          { lat: 27.8058, lng: 86.7108, description: 'Namche Bazaar waste collection' },
          { lat: 27.9011, lng: 86.8362, description: 'Dingboche waste disposal' },
          { lat: 28.0026, lng: 86.8528, description: 'Gorak Shep waste point' }
        ],
        route: [
          { name: 'Lukla', lat: 27.6880, lng: 86.7312, altitude: '2,840m' },
          { name: 'Phakding', lat: 27.7400, lng: 86.7100, altitude: '2,610m' },
          { name: 'Monjo', lat: 27.7800, lng: 86.7050, altitude: '2,835m' },
          { name: 'Namche Bazaar', lat: 27.8058, lng: 86.7108, altitude: '3,440m' },
          { name: 'Tengboche', lat: 27.8333, lng: 86.7667, altitude: '3,870m' },
          { name: 'Pangboche', lat: 27.8600, lng: 86.7900, altitude: '3,985m' },
          { name: 'Dingboche', lat: 27.9011, lng: 86.8362, altitude: '4,410m' },
          { name: 'Duglha', lat: 27.9300, lng: 86.8500, altitude: '4,620m' },
          { name: 'Lobuche', lat: 27.9581, lng: 86.8644, altitude: '4,940m' },
          { name: 'Gorak Shep', lat: 28.0026, lng: 86.8528, altitude: '5,164m' },
          { name: 'Everest Base Camp', lat: 28.0026, lng: 86.8528, altitude: '5,364m' }
        ]
      },
      {
        name: 'Langtang Valley Trek',
        description: 'A beautiful and relatively less crowded trek through Langtang National Park. The 7-10 day journey offers stunning valley scenery, rich Tamang culture, and wonderful wildlife viewing opportunities.',
        difficulty: 'moderate',
        duration: '7-10 days',
        maxAltitude: '4,984m (Kyanjin Ri)',
        bestSeason: 'October-November, March-May',
        highlights: [
          'Langtang Valley views',
          'Kyanjin Gompa monastery',
          'Tamang culture',
          'Wildlife spotting',
          'Less crowded trails'
        ],
        shops: [
          { name: 'Dhunche Market', lat: 28.1328, lng: 85.2694, description: 'Starting point supplies' },
          { name: 'Langtang Village Store', lat: 28.2389, lng: 85.5550, description: 'Mid-trek supplies' },
          { name: 'Kyanjin Gompa Shop', lat: 28.2333, lng: 85.6167, description: 'Final supply point' }
        ],
        wastePoints: [
          { lat: 28.1328, lng: 85.2694, description: 'Dhunche waste collection' },
          { lat: 28.2389, lng: 85.5550, description: 'Langtang Village waste point' },
          { lat: 28.2333, lng: 85.6167, description: 'Kyanjin Gompa waste management' }
        ],
        route: [
          { name: 'Dhunche', lat: 28.1328, lng: 85.2694, altitude: '1,950m' },
          { name: 'Syabrubesi', lat: 28.1167, lng: 85.3333, altitude: '1,460m' },
          { name: 'Lama Hotel', lat: 28.1500, lng: 85.4000, altitude: '2,470m' },
          { name: 'Langtang Village', lat: 28.2389, lng: 85.5550, altitude: '3,430m' },
          { name: 'Kyanjin Gompa', lat: 28.2333, lng: 85.6167, altitude: '3,870m' },
          { name: 'Kyanjin Ri', lat: 28.2333, lng: 85.6167, altitude: '4,984m' }
        ]
      },
      {
        name: 'Manaslu Circuit Trek',
        description: 'A spectacular and challenging trek around Manaslu, the world\'s eighth-highest mountain. This 14-16 day adventure offers pristine wilderness, Tibetan-influenced culture, and dramatic mountain scenery. The trek crosses the challenging Larkya La Pass (5,106m) and takes you through remote villages untouched by mass tourism.',
        difficulty: 'hard',
        duration: '14-16 days',
        maxAltitude: '5,106m (Larkya La Pass)',
        bestSeason: 'October-November, April-May',
        highlights: [
          'Larkya La Pass crossing',
          'Tibetan-influenced culture',
          'Manaslu Base Camp',
          'Remote mountain villages',
          'Pristine wilderness'
        ],
        shops: [
          { name: 'Sotikhola Market', lat: 28.1167, lng: 84.7833, description: 'Starting point supplies' },
          { name: 'Jagat Trading Post', lat: 28.3000, lng: 84.7000, description: 'Mid-trek supplies' },
          { name: 'Samdo Shop', lat: 28.5500, lng: 84.6333, description: 'Pre-pass supplies' },
          { name: 'Bimthang Store', lat: 28.6167, lng: 84.5500, description: 'Post-pass supplies' }
        ],
        wastePoints: [
          { lat: 28.1167, lng: 84.7833, description: 'Sotikhola waste collection' },
          { lat: 28.3000, lng: 84.7000, description: 'Jagat waste disposal' },
          { lat: 28.5500, lng: 84.6333, description: 'Samdo waste management' },
          { lat: 28.6167, lng: 84.5500, description: 'Bimthang waste point' }
        ],
        route: [
          { name: 'Sotikhola', lat: 28.1167, lng: 84.7833, altitude: '710m' },
          { name: 'Machha Khola', lat: 28.1833, lng: 84.7667, altitude: '869m' },
          { name: 'Jagat', lat: 28.3000, lng: 84.7000, altitude: '1,410m' },
          { name: 'Deng', lat: 28.3667, lng: 84.6833, altitude: '1,860m' },
          { name: 'Namrung', lat: 28.4333, lng: 84.6500, altitude: '2,630m' },
          { name: 'Lho', lat: 28.4833, lng: 84.6167, altitude: '3,180m' },
          { name: 'Samagaon', lat: 28.5167, lng: 84.6000, altitude: '3,530m' },
          { name: 'Samdo', lat: 28.5500, lng: 84.6333, altitude: '3,860m' },
          { name: 'Dharamsala', lat: 28.5667, lng: 84.6167, altitude: '4,460m' },
          { name: 'Larkya La Pass', lat: 28.5833, lng: 84.5833, altitude: '5,106m' },
          { name: 'Bimthang', lat: 28.6167, lng: 84.5500, altitude: '3,720m' },
          { name: 'Tilije', lat: 28.6500, lng: 84.5000, altitude: '2,300m' },
          { name: 'Dharapani', lat: 28.6667, lng: 84.4833, altitude: '1,860m' }
        ]
      },
      {
        name: 'Gosaikunda Lake Trek',
        description: 'A beautiful short trek to the sacred Gosaikunda Lake, revered by both Hindus and Buddhists. This 4-5 day journey offers stunning alpine scenery, religious significance, and panoramic mountain views. Perfect for those with limited time seeking a spiritual and scenic experience.',
        difficulty: 'moderate',
        duration: '4-5 days',
        maxAltitude: '4,380m (Gosaikunda Lake)',
        bestSeason: 'March-May, October-November',
        highlights: [
          'Sacred Gosaikunda Lake',
          'Panoramic mountain views',
          'Religious significance',
          'Alpine landscapes',
          'Short duration'
        ],
        shops: [
          { name: 'Dhunche Market', lat: 28.1328, lng: 85.2694, description: 'Starting point supplies' },
          { name: 'Cholang Pati Shop', lat: 28.1500, lng: 85.3167, description: 'Mid-trek supplies' },
          { name: 'Gosaikunda Shop', lat: 28.1833, lng: 85.3333, description: 'Lake area supplies' }
        ],
        wastePoints: [
          { lat: 28.1328, lng: 85.2694, description: 'Dhunche waste collection' },
          { lat: 28.1500, lng: 85.3167, description: 'Cholang Pati waste disposal' },
          { lat: 28.1833, lng: 85.3333, description: 'Gosaikunda waste management' }
        ],
        route: [
          { name: 'Dhunche', lat: 28.1328, lng: 85.2694, altitude: '1,950m' },
          { name: 'Thulo Syabru', lat: 28.1500, lng: 85.2833, altitude: '2,200m' },
          { name: 'Sing Gompa', lat: 28.1667, lng: 85.3000, altitude: '3,584m' },
          { name: 'Laurebina Yak', lat: 28.1833, lng: 85.3167, altitude: '3,900m' },
          { name: 'Gosaikunda', lat: 28.1833, lng: 85.3333, altitude: '4,380m' },
          { name: 'Cholang Pati', lat: 28.1500, lng: 85.3167, altitude: '3,650m' }
        ]
      },
      {
        name: 'Upper Mustang Trek',
        description: 'A unique trek into the forbidden kingdom of Mustang, a remote region with strong Tibetan culture and dramatic desert landscapes. This 12-14 day journey takes you through ancient caves, monasteries, and walled cities that feel like stepping back in time.',
        difficulty: 'moderate',
        duration: '12-14 days',
        maxAltitude: '3,850m (Lo Manthang)',
        bestSeason: 'March-May, September-November',
        highlights: [
          'Lo Manthang walled city',
          'Tibetan culture immersion',
          'Ancient cave dwellings',
          'Desert landscapes',
          'Chortens and monasteries'
        ],
        shops: [
          { name: 'Pokhara Equipment', lat: 28.2096, lng: 83.9856, description: 'Starting supplies' },
          { name: 'Jomsom Market', lat: 28.7833, lng: 83.7167, description: 'Major supply point' },
          { name: 'Lo Manthang Shop', lat: 29.1833, lng: 83.9667, description: 'Ancient city supplies' }
        ],
        wastePoints: [
          { lat: 28.7833, lng: 83.7167, description: 'Jomsom waste management' },
          { lat: 29.0500, lng: 83.8833, description: 'Kagbeni waste collection' },
          { lat: 29.1833, lng: 83.9667, description: 'Lo Manthang waste disposal' }
        ],
        route: [
          { name: 'Pokhara', lat: 28.2096, lng: 83.9856, altitude: '822m' },
          { name: 'Jomsom', lat: 28.7833, lng: 83.7167, altitude: '2,720m' },
          { name: 'Kagbeni', lat: 29.0500, lng: 83.8833, altitude: '2,804m' },
          { name: 'Chele', lat: 29.1000, lng: 83.9000, altitude: '3,100m' },
          { name: 'Syanboche', lat: 29.1333, lng: 83.9167, altitude: '3,475m' },
          { name: 'Ghami', lat: 29.1500, lng: 83.9333, altitude: '3,520m' },
          { name: 'Charang', lat: 29.1667, lng: 83.9500, altitude: '3,560m' },
          { name: 'Lo Manthang', lat: 29.1833, lng: 83.9667, altitude: '3,850m' }
        ]
      },
      {
        name: 'Poon Hill Trek',
        description: 'A popular short trek offering stunning sunrise views from Poon Hill overlooking the Annapurna and Dhaulagiri ranges. This 4-5 day journey is perfect for beginners and families, passing through beautiful rhododendron forests and traditional Gurung villages.',
        difficulty: 'easy',
        duration: '4-5 days',
        maxAltitude: '3,210m (Poon Hill)',
        bestSeason: 'October-November, March-May',
        highlights: [
          'Poon Hill sunrise views',
          'Rhododendron forests',
          'Gurung culture',
          'Family-friendly',
          'Short duration'
        ],
        shops: [
          { name: 'Pokhara Gear', lat: 28.2096, lng: 83.9856, description: 'Starting supplies' },
          { name: 'Nayapul Shop', lat: 28.2667, lng: 83.9167, description: 'Trek start supplies' },
          { name: 'Ghorepani Market', lat: 28.4000, lng: 83.7667, description: 'Mountain supplies' }
        ],
        wastePoints: [
          { lat: 28.2667, lng: 83.9167, description: 'Nayapul waste collection' },
          { lat: 28.3500, lng: 83.8500, description: 'Ulleri waste disposal' },
          { lat: 28.4000, lng: 83.7667, description: 'Ghorepani waste management' }
        ],
        route: [
          { name: 'Pokhara', lat: 28.2096, lng: 83.9856, altitude: '822m' },
          { name: 'Nayapul', lat: 28.2667, lng: 83.9167, altitude: '1,070m' },
          { name: 'Tikhedhunga', lat: 28.3000, lng: 83.8833, altitude: '1,577m' },
          { name: 'Ulleri', lat: 28.3500, lng: 83.8500, altitude: '2,070m' },
          { name: 'Ghorepani', lat: 28.4000, lng: 83.7667, altitude: '2,874m' },
          { name: 'Poon Hill', lat: 28.4167, lng: 83.7500, altitude: '3,210m' },
          { name: 'Ghandruk', lat: 28.4333, lng: 83.8167, altitude: '1,940m' }
        ]
      }
    ];

    const treks = await TrekModel.insertMany(sampleTreks);

    // Add sample guides
    const sampleGuides = [
      {
        userId: users[0]._id,
        fullName: 'Tenzing Sherpa',
        age: 35,
        education: 'Bachelor in Tourism',
        experienceYears: 12,
        wagesPerDay: 5000,
        bio: 'Experienced mountain guide with over 12 years of trekking expertise in the Himalayas. Specialized in Everest region treks. Fluent in English, Nepali, and Sherpa. Certified by Nepal Mountaineering Association.',
        photoUrl: '',
      },
      {
        userId: users[1]._id,
        fullName: 'Suman Tamang',
        age: 28,
        education: 'Diploma in Adventure Tourism',
        experienceYears: 6,
        wagesPerDay: 3500,
        bio: 'Young and energetic guide specializing in Langtang and Annapurna regions. Passionate about nature and culture. Great at photography and storytelling. Safe and responsible trekking practices.',
        photoUrl: '',
      },
      {
        userId: users[2]._id,
        fullName: 'Raj Gurung',
        age: 42,
        education: 'Masters in Himalayan Studies',
        experienceYears: 18,
        wagesPerDay: 6000,
        bio: 'Veteran guide with extensive experience across all major trekking routes in Nepal. Expert in high-altitude trekking and mountain safety. Published author on Himalayan culture and trekking.',
        photoUrl: '',
      },
      {
        userId: users[3]._id,
        fullName: 'Maya Ghale',
        age: 31,
        education: 'Bachelor in Environmental Science',
        experienceYears: 8,
        wagesPerDay: 4000,
        bio: 'Female guide passionate about sustainable trekking and women empowerment. Specializes in family-friendly treks and cultural tours. Advocate for eco-friendly practices on the trails.',
        photoUrl: '',
      },
      {
        userId: users[4]._id,
        fullName: 'Dawa Sherpa',
        age: 39,
        education: 'Certified Mountain Guide',
        experienceYears: 15,
        wagesPerDay: 5500,
        bio: 'High-altitude specialist with multiple Everest summit experiences. Expert in extreme weather conditions and emergency response. Certified in wilderness first aid and rescue operations.',
        photoUrl: '',
      },
    ];

    const guides = await GuideModel.insertMany(sampleGuides);

    return NextResponse.json(
      { 
        message: `Successfully seeded ${treks.length} treks, ${guides.length} guides, and ${users.length} users`, 
        treks, 
        guides, 
        users 
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
