export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#f8f9ff",
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(147, 197, 253, 0.3) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(196, 181, 253, 0.3) 0%, transparent 55%),
          radial-gradient(ellipse at 60% 80%, rgba(165, 180, 252, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 90% 70%, rgba(147, 197, 253, 0.3) 0%, transparent 45%)
        `,
      }}
    >
      {children}
    </div>
  );
}
