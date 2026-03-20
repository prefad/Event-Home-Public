import { createContext, useContext } from 'react';

const PreviewContext = createContext(false);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  return <PreviewContext.Provider value={true}>{children}</PreviewContext.Provider>;
}

export function useIsPreview() {
  return useContext(PreviewContext);
}
