import { useState, useEffect } from 'react';

export function Footer() {
  const [currentDate, setCurrentDate] = useState<string>('');
  
  useEffect(() => {
    // Format the date as MM/DD/YYYY
    const now = new Date();
    // get current year
    setCurrentDate(now.getFullYear().toString());
  }, []);
  
  return (
    <footer className="mt-auto py-4 border-t border-border">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div>Made with ❤️ by <a 
            href="https://mehdichioukh.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-1 font-medium hover:text-primary transition-colors duration-300"
          >
            @hiimmehdi
          </a></div>
        <div className="flex items-center">
          <span>© {currentDate}</span>
          <a 
            href="https://ecomflow.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-1 font-medium hover:text-primary transition-colors"
          >
            @ecomflow
          </a>
        </div>
      </div>
    </footer>
  );
} 