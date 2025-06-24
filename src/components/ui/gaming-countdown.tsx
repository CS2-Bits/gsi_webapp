"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface GamingCountdownProps {
  targetDate: Date;
  onExpire?: () => void;
  className?: string;
}

export function GamingCountdown({
  targetDate,
  onExpire,
  className = "",
}: GamingCountdownProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        setIsExpired(true);
        onExpire?.();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ minutes, seconds });
      setIsExpired(false);
    };

    // Calculate immediately
    calculateTimeLeft();

    // Set up interval
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (isExpired) {
    return (
      <div
        className={`inline-flex items-center justify-center w-full ${className}`}
      >
        <div className="px-2 py-1 rounded-md bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20 border border-red-500/30 shadow-lg">
          <span className="gaming-text-primary text-xs font-bold uppercase tracking-wide">
            {t("inventory.countdown.expired")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center w-full ${className}`}
    >
      <div className="flex items-center justify-center gap-0.5 px-2 py-1 rounded-md bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 border border-orange-500/30 shadow-lg min-w-0">
        <div className="flex flex-col items-center min-w-0">
          <span className="gaming-text-primary text-base font-bold font-mono leading-none">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </span>
          <span className="gaming-text-secondary text-[10px] font-medium uppercase tracking-tight leading-none">
            MIN
          </span>
        </div>
        <div className="gaming-text-primary text-base font-bold font-mono animate-pulse px-0.5">
          :
        </div>
        <div className="flex flex-col items-center min-w-0">
          <span className="gaming-text-primary text-base font-bold font-mono leading-none">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </span>
          <span className="gaming-text-secondary text-[10px] font-medium uppercase tracking-tight leading-none">
            SEG
          </span>
        </div>
      </div>
    </div>
  );
}
