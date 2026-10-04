import { ImageResponse } from 'next/og';

export const alt = 'Free Backlink Opportunity Finder for trades businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#0b0b0b',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 30, color: '#22c55e', marginBottom: 24 }}>RankinSEO - Free tool</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
          Free Backlink Opportunity Finder
        </div>
        <div style={{ fontSize: 34, color: '#d4d4d4', marginTop: 28 }}>
          Find sites where your trade business can get listed. Get the list as a PDF.
        </div>
      </div>
    ),
    size
  );
}