'use client';

interface SEOHeadProps {
  structuredData?: object | object[];
  children?: React.ReactNode;
}

export default function SEOHead({ structuredData, children }: SEOHeadProps) {
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              Array.isArray(structuredData) ? structuredData : [structuredData]
            ),
          }}
        />
      )}
      {children}
    </>
  );
} 