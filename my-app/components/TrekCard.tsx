import Link from 'next/link';
import { Trek } from '@/types/trek';

interface TrekCardProps {
  trek: Trek;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export default function TrekCard({ trek }: TrekCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="h-48 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
        <span className="text-6xl filter drop-shadow-lg">🏔️</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">{trek.name}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[trek.difficulty]}`}>
            {trek.difficulty.toUpperCase()}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{trek.description.substring(0, 120)}...</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>🏪 {trek.shops?.length || 0} shops</span>
          <span>♻️ {trek.wastePoints?.length || 0} waste points</span>
        </div>
        <Link
          href={`/treks/${trek._id}`}
          className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

