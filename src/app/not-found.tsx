import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 font-heading">404 – It's gone!</h1>
      <p className="text-xl mb-8">I looked left, I looked right… then I forgot what I was looking for!</p>
      <Link 
        href="/" 
        className="px-6 py-3 text-white bg-vpn-blue rounded-md hover:opacity-90 transition-colors"
      >
        Back to the homepage — just like that!
      </Link>
    </div>
  );
}
