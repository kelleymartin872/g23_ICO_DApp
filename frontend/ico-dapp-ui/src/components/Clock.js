import React, { useState, useEffect } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const gmtTime = time.toUTCString();

  return (
    <div>
      <h3> {gmtTime} </h3>
      
    </div>
  );
}

export default Clock;