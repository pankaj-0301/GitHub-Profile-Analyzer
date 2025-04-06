# GitHub Profile Analyzer

A React application that analyzes GitHub profiles and displays user activity metrics including repositories and commit history.

## Features

- Search for GitHub users by username
- Display user's recent repositories with:
  - Repository name and description
  - Programming language
  - Star count
  - Direct links to repositories
- Visualize commit activity with a daily chart
- Responsive design
- Modern UI with shadcn/ui components

## Technologies Used

- React
- TypeScript
- shadcn/ui for UI components
- Tailwind CSS for styling
- Lucide React for icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local server URL

## Building for Production

1. Build the project:
   ```bash
   npm run build
   ```
2. The built files will be in the `dist` directory
3. Deploy the contents of the `dist` directory to your hosting provider

## Deployment Options

### Netlify

1. Create a new site on Netlify
2. Connect your repository
3. Set the build command to: `npm run build`
4. Set the publish directory to: `dist`
5. Deploy!

### Vercel

1. Import your repository on Vercel
2. Vercel will automatically detect the build settings
3. Deploy!

## Notes

- The application uses the GitHub API without authentication, which has rate limiting
- For production use, consider implementing GitHub OAuth to increase API rate limits
- The commit activity chart shows data from the last 7 days of activity

## License

MIT