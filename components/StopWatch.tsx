"use client"

import React, { useState, useEffect } from "react";

const Stopwatch = () => {
  const [time, setTime] = useState("00:00:00");

  useEffect(() => {
    const startTime = Date.now();

    const updateTimer = () => {
      const elapsedTime = Date.now() - startTime;
      const hours = Math.floor(elapsedTime / 3600000).toString().padStart(2, "0");
      const minutes = Math.floor((elapsedTime % 3600000) / 60000).toString().padStart(2, "0");
      const seconds = Math.floor((elapsedTime % 60000) / 1000).toString().padStart(2, "0");
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>{time}</div>;
};

export default Stopwatch;