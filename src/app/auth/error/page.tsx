import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your link may have expired or already been used.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/login"
          className="block w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors text-center"
        >
          Back to login
        </Link>
        <Link
          href="/signup"
          className="block w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          Create a new account
        </Link>
      </div>
    </>
  );
}
