import { useState, useEffect } from 'react';

interface MachineTimerProps {
  endTime: string | number;
  position?: 'top' | 'bottom';
  onTimerComplete?: () => void; // Tambahkan parameter ini
}

export const useMachineTimer = ({ endTime, onTimerComplete }: MachineTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('00 : 00');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTimestamp = Date.parse(endTime.toString()) / 1000;
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };

      const now = new Date();
      const nowID = new Intl.DateTimeFormat('en-US', options).format(now);
      const currentTimestamp = Date.parse(nowID) / 1000;

      const remainingTime = endTimestamp - currentTimestamp;

      if (remainingTime < 1) {
        setTimeLeft('00 : 00');
        setIsReady(true);
        if (onTimerComplete) {
          onTimerComplete(); // Panggil callback jika waktu habis
        }
        return;
      }

      const days = Math.floor(remainingTime / 86400);
      const hours = Math.floor((remainingTime - days * 86400) / 3600);
      const minutes = Math.floor(
        (remainingTime - days * 86400 - hours * 3600) / 60
      );
      const seconds = Math.floor(
        remainingTime - days * 86400 - hours * 3600 - minutes * 60
      );

      const formattedHours = hours < 10 ? `0${hours}` : hours.toString();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

      const displayTime =
        hours > 0
          ? `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`
          : `${formattedMinutes} : ${formattedSeconds}`;

      setTimeLeft(displayTime);
      setIsReady(false);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, [endTime, onTimerComplete]);

  return { timeLeft, isReady };
};