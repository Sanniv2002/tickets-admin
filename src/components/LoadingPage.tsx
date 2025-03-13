const LoadingPage = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 min-h-screen w-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 className="text-xl font-semibold text-white">Loading...</h2>
        <p className="text-gray-400 mt-2">Please wait while we set things up</p>
      </div>
    </div>
  );
};

export default LoadingPage;