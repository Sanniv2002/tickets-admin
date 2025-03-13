import { Loader2 } from 'lucide-react';

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 min-h-screen w-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-white">Loading...</h2>
        <p className="text-gray-400 mt-2">Please wait while we set things up</p>
      </div>
    </div>
  );
};

export default LoadingPage;