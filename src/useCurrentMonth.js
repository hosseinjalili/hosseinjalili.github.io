import { useEffect, useState } from "react";

function monthStart(date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function useCurrentMonth() {
  const [month, setMonth] = useState(() => monthStart());

  useEffect(() => {
    let timeout;
    function update() {
      clearTimeout(timeout);
      const now = new Date();
      setMonth(monthStart(now));
      const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
      timeout = setTimeout(
        update,
        Math.min(next - now.getTime(), 60 * 60 * 1000),
      );
    }

    update();
    window.addEventListener("pageshow", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("pageshow", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return new Date(month);
}
