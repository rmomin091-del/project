import './globals.css';

export const metadata = {
  title: 'Issue Tracker — Internal Dashboard',
  description: 'Internal issue tracking tool for managing bugs, feature requests, and improvements across projects.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" defer></script>
        <script src="https://cdn.socket.io/4.7.4/socket.io.min.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
