import { MapPinOff } from "lucide-react";
import Button from "../components/UI/Button";

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center py-20">
      <MapPinOff className="w-14 h-14 text-primary mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button href="/" className="bg-primary text-white px-6 py-3 rounded-full font-semibold">
        Back to Home
      </Button>
    </div>
  );
}

export default NotFound;
