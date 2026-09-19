import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';
import { Brighty } from '@/components/Brighty';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-card rounded-3xl p-12 text-center shadow-2xl max-w-2xl"
      >
        <Brighty size={150} />
        <div className="flex items-center justify-center gap-3 mt-8 mb-6">
          <AlertCircle className="w-12 h-12 text-orange-600" />
          <h1 className="text-6xl font-black text-foreground">404</h1>
        </div>
        <h2 className="text-3xl font-black text-foreground mb-4">Page Not Found</h2>
        <p className="text-xl text-muted-foreground font-semibold mb-8">
          Oops! This page seems to be hiding. Let's go back home!
        </p>
        <Link href="/home">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xl rounded-2xl h-16 px-8"
          >
            <Home className="w-6 h-6 mr-2" />
            Go Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
