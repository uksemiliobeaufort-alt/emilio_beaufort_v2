import { BagProvider } from '@/components/BagContext';
import { AuthProvider } from '@/contexts/AuthContext';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <BagProvider>
        <Component {...pageProps} />
      </BagProvider>
    </AuthProvider>
  );
}

export default MyApp;
