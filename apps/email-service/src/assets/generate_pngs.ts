import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgAssets = {
  logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396.62 75.15" width="400" height="76"><defs><style>.cls-1{fill:#06f4f4;}.cls-1,.cls-2{fill-rule:evenodd;}.cls-2,.cls-3{fill:#0270f6;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M7.09,23.35c3.32.47,4.3,7.69,5.47,18.94C14.32,59.13,32.22,64.65,51.7,53.74c1.09-.64,1.89-.09,1.64.58A28.7,28.7,0,0,1,26.23,67.67,29,29,0,0,1,.88,46C.38,44.11-.8,38,.83,32.71,2.37,27.72,6.13,23.73,7.09,23.35Z" transform="translate(0 -9.99)"/><path class="cls-2" d="M12.83,15.92C15.16,12.72,21.94,10,28.51,10,44.17,10,57.39,19.37,67,35.75c6.78,11.53,16.17,20.72,28.71,16.14,13.22-4.82,9.74-25.19-.43-32a17.56,17.56,0,0,0-20.4.67c-10.27,8.29-10.06-.83-3.09-6.11,4-3,14.51-6.14,23.84-2.87,11.2,3.4,20.14,13.72,20.14,28.1a27.84,27.84,0,0,1-7.5,18.78c-1,1-7.34,8.16-17.55,9.31-11,1.25-22.08-3.23-28.47-13.5-4.78-6.75-9.36-20-15.74-27.33-5.47-7.29-21.32-15.1-26.88-4.57-1.44,2.72-2.44,3.93-3.12,4.15C12.92,29.68,10,19.58,12.83,15.92Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M162,69.29A28.86,28.86,0,0,1,150.4,67a28.26,28.26,0,0,1-9.24-6.38,29.71,29.71,0,0,1-6.1-9.44,30.15,30.15,0,0,1-2.18-11.53,30.2,30.2,0,0,1,2.18-11.54,29.66,29.66,0,0,1,6.1-9.43,28.26,28.26,0,0,1,9.24-6.38,30.28,30.28,0,0,1,23.15,0,28.12,28.12,0,0,1,9.23,6.38,29.69,29.69,0,0,1,6.11,9.43,30.39,30.39,0,0,1,2.18,11.54,30.34,30.34,0,0,1-2.18,11.53,29.74,29.74,0,0,1-6.11,9.44A28.12,28.12,0,0,1,173.55,67,28.91,28.91,0,0,1,162,69.29Zm0-6.42a21.71,21.71,0,0,0,19.27-11.14,24,24,0,0,0,3-12.09,24,24,0,0,0-3-12.13,22.17,22.17,0,0,0-38.53,0,23.86,23.86,0,0,0-3,12.13,23.94,23.94,0,0,0,3,12.09A21.8,21.8,0,0,0,162,62.87Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M196,68V27.59h6.42v5.94h.32a12.84,12.84,0,0,1,3.05-3.6,16,16,0,0,1,4.44-2.62,14.43,14.43,0,0,1,12.88,1.19,12.28,12.28,0,0,1,4.68,5.67,17.05,17.05,0,0,1,5.55-5.63,15.16,15.16,0,0,1,8.32-2.22q7.22,0,10.62,4.36t3.41,11.42V68H249V43.13c0-3.91-.79-6.68-2.37-8.29a10,10,0,0,0-12.25-.63,12.43,12.43,0,0,0-3.81,4.67,14.49,14.49,0,0,0-1.38,6.31V68h-6.74V43.21c0-3.92-.8-6.69-2.38-8.33a9.76,9.76,0,0,0-12.17-.63,12.5,12.5,0,0,0-3.8,4.75,14.6,14.6,0,0,0-1.39,6.35V68Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M265,20.14a4.88,4.88,0,0,1-4.84-4.84,4.64,4.64,0,0,1,1.43-3.45,4.81,4.81,0,0,1,8.24,3.45,4.73,4.73,0,0,1-1.38,3.41A4.64,4.64,0,0,1,265,20.14ZM261.7,68V27.59h6.74V68Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M274.78,68V27.59h6.42v5.94h.32a13.47,13.47,0,0,1,5.19-5.07,15.13,15.13,0,0,1,7.89-2.14q7.44,0,11.21,4.32t3.77,11.46V68h-6.74V43.13c0-3.91-.94-6.68-2.81-8.29a10.77,10.77,0,0,0-7.26-2.42,9.64,9.64,0,0,0-5.86,1.87,12.71,12.71,0,0,0-4,4.79,14,14,0,0,0-1.42,6.19V68Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M318.93,20.14a4.87,4.87,0,0,1-4.83-4.84,4.63,4.63,0,0,1,1.42-3.45,4.76,4.76,0,0,1,3.41-1.39,4.75,4.75,0,0,1,4.84,4.84,4.7,4.7,0,0,1-1.39,3.41A4.61,4.61,0,0,1,318.93,20.14ZM315.6,68V27.59h6.74V68Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M325.75,33.69v-6.1h7.85v6.1ZM333.2,68V23.23a12.75,12.75,0,0,1,1.63-6.54,11.51,11.51,0,0,1,4.6-4.44,14.25,14.25,0,0,1,6.93-1.63,17.76,17.76,0,0,1,2.94.24,17.31,17.31,0,0,1,2.77.71v6.58a20.58,20.58,0,0,0-3-.95,11.75,11.75,0,0,0-2.58-.31,6.29,6.29,0,0,0-4.76,1.9,7.15,7.15,0,0,0-1.82,5.15V68Zm6.34-34.33v-6.1h10.79v6.1Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M367.61,66.35,350.48,27.59h7.3l12.68,30h.64ZM366.1,83.08c-.16.37-.34.78-.55,1.23s-.35.72-.4.83h-7c.32-.69.66-1.44,1-2.26l1.35-3c.32-.69.61-1.32.87-1.9s.57-1.23.92-2,.75-1.59,1.22-2.65l5.55-12,1.51-3.73,12.21-30h7.29L369.19,75.87l-1,2.26c-.45,1-.87,2-1.27,3S366.26,82.76,366.1,83.08Z" transform="translate(0 -9.99)"/><path class="cls-3" d="M391.55,68.49a5,5,0,0,1-5.07-5.07,4.81,4.81,0,0,1,1.46-3.53,5.19,5.19,0,0,1,7.22,0,4.85,4.85,0,0,1,1.46,3.53,5,5,0,0,1-5.07,5.07Z" transform="translate(0 -9.99)"/></g></g></svg>`,

  party: `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="44" fill="#FEF3C7"/><path d="M24 72l32-12-12-32-20 44z" fill="#D97706"/><path d="M48 24h4v4h-4zM68 40h4v4h-4zM56 16h4v4h-4zM72 64h4v4h-4z" fill="#F59E0B"/></svg>`,

  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#DBEAFE"/><path d="M32 16H16v16l22 22 16-16L32 16z" fill="none" stroke="#2563EB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="3" fill="#2563EB"/></svg>`,

  truck: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F3E8FF"/><path d="M12 20h24v20H12z" fill="none" stroke="#9333EA" stroke-width="4" stroke-linejoin="round"/><path d="M36 28h8l6 6v10H36V28z" fill="none" stroke="#9333EA" stroke-width="4" stroke-linejoin="round"/><circle cx="22" cy="44" r="4" fill="none" stroke="#9333EA" stroke-width="4"/><circle cx="44" cy="44" r="4" fill="none" stroke="#9333EA" stroke-width="4"/></svg>`,

  card: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#DCFCE7"/><rect x="12" y="20" width="40" height="26" rx="4" fill="none" stroke="#16A34A" stroke-width="4"/><line x1="12" y1="28" x2="52" y2="28" stroke="#16A34A" stroke-width="4"/></svg>`,

  headset: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#DBEAFE"/><path d="M20 40V28a12 12 0 0 1 24 0v12" fill="none" stroke="#2563EB" stroke-width="4" stroke-linecap="round"/><rect x="16" y="34" width="6" height="10" rx="2" fill="#2563EB"/><rect x="42" y="34" width="6" height="10" rx="2" fill="#2563EB"/></svg>`,

  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#DBEAFE"/><path d="M32 48s14-7 14-18V18L32 12.5 18 18v12c0 11 14 18 14 18z" fill="none" stroke="#2563EB" stroke-width="4" stroke-linejoin="round"/><path d="M26 30l4 4 8-8" fill="none" stroke="#2563EB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  return: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#DCFCE7"/><path d="M18 32a14 14 0 1 0 14-14 15 15 0 0 0-10.5 4.5L18 26" fill="none" stroke="#16A34A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 18v8h8" fill="none" stroke="#16A34A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  star: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#FEF3C7"/><path d="M32 16l4.9 10 11.1 1.6-8 7.8 1.9 11-9.9-5.2-9.9 5.2 1.9-11-8-7.8 11.1-1.6L32 16z" fill="#D97706"/></svg>`,
};

async function buildPngs() {
  const assetsDir = path.join(__dirname);
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  for (const [key, svg] of Object.entries(svgAssets)) {
    const pngPath = path.join(assetsDir, `${key}.png`);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    console.log(`Generated PNG asset: ${pngPath}`);
  }
}

buildPngs();
