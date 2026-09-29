const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create beautiful, modern PWA Icon SVG
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#020617" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#fef3c7" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Squircle / Rounded App Frame -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-opacity="0.35" />

  <!-- Subtle Ambient Glow -->
  <circle cx="256" cy="230" r="140" fill="#f59e0b" opacity="0.12" filter="url(#glow)" />

  <!-- Stylized Monogram / QR Feedback Motif -->
  <!-- Outer Gold Shield / Diamond Core -->
  <g filter="url(#shadow)">
    <!-- QR Corner Targets (Top-Left, Top-Right, Bottom-Left) -->
    <!-- Top-Left QR Eye -->
    <rect x="110" y="110" width="84" height="84" rx="20" fill="none" stroke="url(#goldGrad)" stroke-width="14" />
    <rect x="133" y="133" width="38" height="38" rx="8" fill="url(#goldGrad)" />

    <!-- Top-Right QR Eye -->
    <rect x="318" y="110" width="84" height="84" rx="20" fill="none" stroke="url(#goldGrad)" stroke-width="14" />
    <rect x="341" y="133" width="38" height="38" rx="8" fill="url(#goldGrad)" />

    <!-- Bottom-Left QR Eye -->
    <rect x="110" y="318" width="84" height="84" rx="20" fill="none" stroke="url(#goldGrad)" stroke-width="14" />
    <rect x="133" y="341" width="38" height="38" rx="8" fill="url(#goldGrad)" />

    <!-- Center Pulse & Star / Crown Emblem -->
    <circle cx="256" cy="256" r="62" fill="url(#goldGrad)" />
    <!-- 5-Point Star in Center -->
    <path d="M 256,215 L 268,243 L 298,245 L 275,265 L 282,295 L 256,279 L 230,295 L 237,265 L 214,245 L 244,243 Z" fill="#0f172a" />

    <!-- Dynamic Signal / Wave Arc (Right Side) -->
    <path d="M 326 270 Q 360 290 350 336" fill="none" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round" />
    <circle cx="360" cy="380" r="16" fill="url(#goldGrad)" />
    <circle cx="295" cy="370" r="12" fill="url(#goldGrad)" />
    <circle cx="390" cy="300" r="8" fill="url(#goldGrad)" />
  </g>

  <!-- Bottom Brand Text Monogram 'RP' for ReviewPulse -->
  <g fill="url(#accentGrad)" opacity="0.95">
    <circle cx="256" cy="430" r="4" fill="#fbbf24" />
    <circle cx="272" cy="430" r="4" fill="#fbbf24" />
    <circle cx="240" cy="430" r="4" fill="#fbbf24" />
  </g>
</svg>`;

// Maskable Icon with safe margins (central 80% safe zone for Android adaptive icons)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#020617" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="goldGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadowMask" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Full background bleed for maskable cropping -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Inner Safe Zone Content (Scaled to 76% to prevent edge clipping) -->
  <g transform="translate(61.44, 61.44) scale(0.76)" filter="url(#shadowMask)">
    <!-- QR Corner Targets -->
    <rect x="110" y="110" width="84" height="84" rx="20" fill="none" stroke="url(#goldGradMask)" stroke-width="14" />
    <rect x="133" y="133" width="38" height="38" rx="8" fill="url(#goldGradMask)" />

    <rect x="318" y="110" width="84" height="84" rx="20" fill="none" stroke="url(#goldGradMask)" stroke-width="14" />
    <rect x="341" y="133" width="38" height="38" rx="8" fill="url(#goldGradMask)" />

    <rect x="110" y="318" width="84" height="84" rx="20" fill="none" stroke="url(#goldGradMask)" stroke-width="14" />
    <rect x="133" y="341" width="38" height="38" rx="8" fill="url(#goldGradMask)" />

    <!-- Center Pulse & Star Motif -->
    <circle cx="256" cy="256" r="62" fill="url(#goldGradMask)" />
    <path d="M 256,215 L 268,243 L 298,245 L 275,265 L 282,295 L 256,279 L 230,295 L 237,265 L 214,245 L 244,243 Z" fill="#0f172a" />

    <!-- Dynamic Signal / Wave Arc -->
    <path d="M 326 270 Q 360 290 350 336" fill="none" stroke="url(#goldGradMask)" stroke-width="12" stroke-linecap="round" />
    <circle cx="360" cy="380" r="16" fill="url(#goldGradMask)" />
    <circle cx="295" cy="370" r="12" fill="url(#goldGradMask)" />
    <circle cx="390" cy="300" r="8" fill="url(#goldGradMask)" />
  </g>
</svg>`;

async function generate() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // 1. Write SVGs
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), standardSvg);
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableSvg);

  const stdBuffer = Buffer.from(standardSvg);
  const maskBuffer = Buffer.from(maskableSvg);

  // 2. Generate PNG sizes
  const targets = [
    { name: 'icon-192x192.png', size: 192, buffer: stdBuffer },
    { name: 'icon-512x512.png', size: 512, buffer: stdBuffer },
    { name: 'icon-512x512-maskable.png', size: 512, buffer: maskBuffer },
    { name: 'apple-touch-icon.png', size: 180, buffer: stdBuffer },
    { name: 'favicon-32x32.png', size: 32, buffer: stdBuffer },
    { name: 'favicon-16x16.png', size: 16, buffer: stdBuffer },
  ];

  for (const t of targets) {
    const outPath = path.join(iconsDir, t.name);
    await sharp(t.buffer)
      .resize(t.size, t.size)
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outPath);
    console.log(`Generated: ${t.name} (${t.size}x${t.size})`);
  }

  // Also copy apple-touch-icon and icon-192 to public root for maximum compatibility
  await sharp(stdBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icon-192x192.png'));

  await sharp(stdBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'icon-512x512.png'));

  await sharp(stdBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'));

  console.log('PWA icon generation complete!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
