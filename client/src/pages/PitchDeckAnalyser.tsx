import { Link } from 'wouter';
import PitchDeckAnalyser from '../components/PitchDeckAnalyser';

export default function PitchDeckAnalyserPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link 
            href="/toolkit"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#5193B3] dark:hover:text-[#62C4C3] transition-colors"
          >
            <i className="fas fa-arrow-left" aria-hidden="true"></i>
            Back to Toolkit
          </Link>
          <div className="text-gray-300 dark:text-gray-600">•</div>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Pitch Deck Analyser</span>
        </div>
      </div>

      <PitchDeckAnalyser />
    </div>
  );
}