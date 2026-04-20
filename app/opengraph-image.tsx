import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Refugio en la Palabra - App Católica de Oración';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1F3A5F 0%, #162a45 50%, #1F3A5F 100%)',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(225,185,85,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #E1B955, #D4AF37, #E1B955)',
            display: 'flex',
          }}
        />

        {/* Cross icon */}
        <div
          style={{
            fontSize: 48,
            marginBottom: 20,
            display: 'flex',
            color: '#E1B955',
          }}
        >
          +
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 16,
            display: 'flex',
          }}
        >
          Refugio en la Palabra
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.4,
            marginBottom: 32,
            display: 'flex',
          }}
        >
          Tu espacio diario para orar y crecer en la fe
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Rosario guiado', 'Evangelio del dia', 'Companero de fe', 'Gratis'].map(
            (text) => (
              <div
                key={text}
                style={{
                  background: 'rgba(225,185,85,0.15)',
                  color: '#E1B955',
                  padding: '8px 20px',
                  borderRadius: '999px',
                  fontSize: 18,
                  fontWeight: 500,
                  display: 'flex',
                }}
              >
                {text}
              </div>
            )
          )}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: 16,
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Hecho en Espana | refugioenlapalabra.com
        </div>
      </div>
    ),
    { ...size }
  );
}
