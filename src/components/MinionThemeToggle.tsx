"use client";
import { useEffect, useState } from "react";
import { useTheme } from 'next-themes'
import styles from './MinionThemeToggle.module.css';

export default function MinionThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  // Only show the toggle after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    if (isToggling) return; // Prevent rapid clicking
    
    setIsToggling(true);
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // Apply theme change immediately
    setTheme(newTheme);
    
    // Reset toggling state after animation completes
    setTimeout(() => {
      setIsToggling(false);
    }, 200); // Match our new transition duration
  };
  
  // Always render the same structure to avoid hydration mismatch
  return (
    <div className={styles.toggle}>
      <input 
        type="checkbox" 
        id="themeToggle"
        // Use suppressHydrationWarning for the checked state that depends on theme
        checked={mounted ? theme === 'dark' : false}
        onChange={handleToggle}
        className={styles.input}
        disabled={isToggling || !mounted}
        aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Loading theme toggle'}
        suppressHydrationWarning={true}
      />
      <label 
        htmlFor="themeToggle" 
        className={styles.label}
        style={{ 
          opacity: mounted ? 1 : 0.7,
          pointerEvents: mounted ? 'auto' : 'none'
        }}
        suppressHydrationWarning={true}
      >
        <span className={styles.thumb}></span>
      </label>
    </div>
  );
} 