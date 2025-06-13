"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function GreetingMessage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeGreeting = "";

      if (hour >= 5 && hour < 12) {
        timeGreeting = "Bom dia";
      } else if (hour >= 12 && hour < 18) {
        timeGreeting = "Boa tarde";
      } else {
        timeGreeting = "Boa noite";
      }

      setGreeting(timeGreeting);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-sm p-5 max-w-lg border border-gray-200 dark:border-gray-700 "
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
         
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {greeting}, {user.name?.split(" ")[0]}! <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Que tal dar uma olhada no seu dashboard hoje?
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 