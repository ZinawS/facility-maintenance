import { Inbox } from "lucide-react";

/**
 * Shown in place of a list/grid when there's no data to display.
 */
function EmptyState({ message = "Nothing here yet.", icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
      {icon || <Inbox className="w-10 h-10 mb-3" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default EmptyState;
