import { BagProvider } from '@/components/BagContext';

function MyApp({ Component, pageProps }) {
  return (
    <BagProvider>
      <Component {...pageProps} />
    </BagProvider>
  );
}

export default MyApp; 