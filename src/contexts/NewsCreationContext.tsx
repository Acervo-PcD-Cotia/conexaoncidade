import { createContext, useContext, useState, ReactNode } from 'react';

export type NewsOrigin = 'manual' | 'ai';

interface NewsPrefillData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_name: string;
  tags: string[];
  featured_image_url: string;
  image_alt: string;
  image_credit: string;
  meta_title: string;
  meta_description: string;
  source: string;
}

interface NewsCreationContextType {
  prefillData: NewsPrefillData | null;
  setPrefillData: (data: NewsPrefillData | null) => void;
  clearPrefillData: () => void;
  origin: NewsOrigin;
  setOrigin: (origin: NewsOrigin) => void;
}

const NewsCreationContext = createContext<NewsCreationContextType | undefined>(undefined);

export function NewsCreationProvider({ children }: { children: ReactNode }) {
  const [prefillData, setPrefillData] = useState<NewsPrefillData | null>(null);
  const [origin, setOrigin] = useState<NewsOrigin>('manual');

  const clearPrefillData = () => {
    setPrefillData(null);
    setOrigin('manual');
  };

  return (
    <NewsCreationContext.Provider 
      value={{ 
        prefillData, 
        setPrefillData, 
        clearPrefillData, 
        origin, 
        setOrigin 
      }}
    >
      {children}
    </NewsCreationContext.Provider>
  );
}

export function useNewsCreation() {
  const context = useContext(NewsCreationContext);
  if (context === undefined) {
    throw new Error('useNewsCreation must be used within a NewsCreationProvider');
  }
  return context;
}
