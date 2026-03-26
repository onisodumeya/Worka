import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
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
      <Toaster position="top-center" richColors />
      <div className="w-full max-h-[90vh] max-w-md px-5 md:px-8 py-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto hide-scrollbar">
        {children}
      </div>
    </div>
  );
}
