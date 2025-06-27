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
      
    >
            <h1 className="text-lg md:text-2xl font-semibold text-gray-700 dark:text-white tracking-tight">
              {greeting}, {user.name?.split(" ")[0]}!
            </h1>
       
    </motion.div>
  );
} 