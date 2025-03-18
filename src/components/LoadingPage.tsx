import { motion } from 'framer-motion';

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 min-h-screen w-full">
      <motion.div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-xl font-semibold text-white mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.h2>
        <p className="text-gray-400">Please wait while we set things up</p>
        
        <motion.div 
          className="mt-6 flex justify-center space-x-2"
          initial="hidden"
          animate="visible"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-red-500 rounded-full"
              animate={{
                y: ["0%", "-50%", "0%"],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingPage;