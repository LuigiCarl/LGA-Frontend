# Budget Tracker

A modern, responsive budget tracking application built with React, TypeScript, and Vite.

## Features

- 📊 Track income and expenses
- 💰 Budget management
- 📈 Visual charts and analytics
- 🌓 Dark mode support
- 📱 Fully responsive design
- 🔐 User authentication

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite 6
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Routing:** React Router 7
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd frontend-budget-tracker
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.development
```

4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
frontend-budget-tracker/
├── src/
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions and routing
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # App entry point
│   └── index.css       # Global CSS
├── public/             # Static assets
├── .vscode/            # VS Code settings
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules (run `npm run lint`)
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names

### TypeScript

- Enable strict mode (already configured)
- Define proper types for props and state
- Avoid using `any` type
- Use type inference when possible

### Best Practices

- Use the `@/` path alias for imports from `src/`
- Wrap components in React.StrictMode (already configured)
- Use environment variables for configuration (prefix with `VITE_`)
- Optimize images and assets
- Follow component composition patterns
- Use React.memo() for expensive components

## Building for Production

```bash
npm run build
```

The optimized production files will be in the `build/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env.development` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_ENV=development
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Your License Here]

## Support

For support, email support@budgettracker.com or open an issue on GitHub.

This is a code bundle for Budget Tracker. The original project is available at https://www.figma.com/design/AeslKBhyZRCklfipbjLWAP/Budget-Tracker.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.
