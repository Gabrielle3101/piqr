import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(document.body.className);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.body.className);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}