import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center py-12';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={containerClasses}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground font-medium"
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default PageLoader;
