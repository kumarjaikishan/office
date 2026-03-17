import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ArrowRight, Download, Share2, Sparkles, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

const App = () => {
  const [copied, setCopied] = useState(false);
  const [viewDetails, setViewDetails] = useState(false);
  const transactionId = "TXN-98234-AX77B";

  // Initial confetti burst
  useEffect(() => {
    const triggerConfetti = () => {
      const end = Date.now() + 3 * 1000;
      const colors = ['#10B981', '#3B82F6', '#F59E0B'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    };

    triggerConfetti();
  }, []);

  const handleManualConfetti = (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { x, y },
      colors: ['#10B981', '#3B82F6']
    });
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = transactionId;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans transition-colors duration-500 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl rounded-3xl p-8 md:p-12 text-center overflow-hidden"
      >
        {/* Confetti Triggering Icon */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleManualConfetti}
          className="relative inline-flex items-center justify-center w-24 h-24 mb-8 cursor-pointer group"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="absolute inset-0 bg-green-500/20 dark:bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/30 transition-colors"
          />
          <div className="relative bg-gradient-to-tr from-green-500 to-emerald-400 p-6 rounded-full shadow-lg shadow-green-500/20">
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Check className="w-12 h-12 text-white stroke-[3px]" />
            </motion.div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border border-dashed border-green-500/30 rounded-full"
          />
        </motion.div>

        {/* Content Stagger */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Payment Received!
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed"
          >
            Your Pro account is now active. Get ready to build something amazing.
          </motion.p>
        </div>

        {/* Transaction ID Pill */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 mb-8 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50"
        >
          <span className="uppercase tracking-wider opacity-60">ID:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200">{transactionId}</span>
          <button 
            onClick={copyToClipboard}
            className="ml-1 hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-white dark:hover:bg-slate-700"
            title="Copy ID"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => setViewDetails(!viewDetails)}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Receipt</span>
          </button>
        </motion.div>

        {/* Hidden Details Section */}
        <AnimatePresence>
          {viewDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8"
            >
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 text-left space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Annual Pro Plan</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">$228.00 USD</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Renewal Date</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Oct 24, 2025</span>
                </div>
                <div className="pt-4 flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-blue-500 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg transition-colors">
                    <Share2 size={14} />
                    Share
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-blue-500 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg transition-colors">
                    <Sparkles size={14} />
                    Upgrade
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Support */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-slate-400 text-xs flex items-center justify-center gap-1"
        >
          Need help? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
        </motion.p>
      </motion.div>

      {/* Quick Nav FAB for demo purposes */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 p-4 bg-white dark:bg-slate-900 shadow-2xl rounded-full text-slate-500 hover:text-blue-500 transition-colors border border-slate-200 dark:border-slate-800"
      >
        <Home size={24} />
      </motion.button>
    </div>
  );
};

export default App;