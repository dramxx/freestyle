import React from "react";
import { useSessionStore } from "../stores/sessionStore";

export const Header: React.FC = () => {
  const { session, isConnected, users } = useSessionStore();

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?session=${session.id}`;
    navigator.clipboard.writeText(url);
    // In a real app, you'd show a toast notification here
    alert("Session link copied to clipboard!");
  };

  return (
    <header className="header px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">CodeCollab</h1>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm text-gray-400">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Session:</span>
            <span className="text-sm font-medium text-gray-300">
              {session.name}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Users:</span>
            <div className="flex -space-x-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {users.length > 0 && (
              <span className="text-sm text-gray-400">({users.length})</span>
            )}
          </div>

          <button onClick={handleShare} className="btn-primary">
            Share
          </button>
        </div>
      </div>
    </header>
  );
};
