# CalorieTools

CalorieTools is a Next.js 14 + TypeScript app using the App Router and Tailwind CSS.

## Requirements

- Node.js 18 or newer
- npm 9+

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Production build

Build the app and start a production server:

```bash
npm run build
npm start
```

## Project Structure

- `app/` – App Router pages and layouts
- `app/layout.tsx` – Global layout with metadata
- `app/page.tsx` – MVP hero page
- `app/globals.css` – Tailwind + global styles
- `tailwind.config.ts` – Tailwind config with responsive container
- `postcss.config.mjs` – PostCSS plugins
- `next.config.ts` – Next.js configuration

## Notes

- The hero includes a disabled placeholder button labelled "Start Calculation".
- Strict TypeScript is enabled. The project should have zero type errors on build.

