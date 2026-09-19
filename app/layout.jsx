import "./globals.css";
export const metadata = {
  title: "BP Learning — Le sens de l’échange",
  description:
    "Un entraînement à la communication en officine. Apprendre, pratiquer et progresser à votre rythme.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
