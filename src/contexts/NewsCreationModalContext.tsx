import { createContext, useContext, useState, ReactNode } from 'react';

interface NewsCreationModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const NewsCreationModalContext = createContext<NewsCreationModalContextType | undefined>(undefined);

export function NewsCreationModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <NewsCreationModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </NewsCreationModalContext.Provider>
  );
}

export function useNewsCreationModal() {
  const context = useContext(NewsCreationModalContext);
  if (!context) {
    throw new Error('useNewsCreationModal must be used within a NewsCreationModalProvider');
  }
  return context;
}
