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
          { name: 'Chame', lat: 28.5500, lng: 84.2333, altitude: '2,670m' },
          { name: 'Manang', lat: 28.6667, lng: 84.0167, altitude: '3,540m' },
          { name: 'Thorong La Pass', lat: 28.7500, lng: 83.9500, altitude: '5,416m' },
          { name: 'Muktinath', lat: 28.8167, lng: 83.8667, altitude: '3,800m' },
          { name: 'Jomsom', lat: 28.7833, lng: 83.7167, altitude: '2,720m' },
          { name: 'Tatopani', lat: 28.6000, lng: 83.5500, altitude: '1,190m' }
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
          { name: 'Namche Bazaar', lat: 27.8058, lng: 86.7108, altitude: '3,440m' },
          { name: 'Tengboche', lat: 27.8333, lng: 86.7667, altitude: '3,870m' },
          { name: 'Dingboche', lat: 27.9011, lng: 86.8362, altitude: '4,410m' },
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
          { name: 'Langtang Village', lat: 28.2389, lng: 85.5550, altitude: '3,430m' },
          { name: 'Kyanjin Gompa', lat: 28.2333, lng: 85.6167, altitude: '3,870m' },
          { name: 'Kyanjin Ri', lat: 28.2333, lng: 85.6167, altitude: '4,984m' }
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
