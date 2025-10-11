import NotificationTroubleshooter from "@/components/NotificationTroubleshooter";
import NotificationManager from "@/components/NotificationManager";

export default function NotificationTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Notification Test & Setup
          </h1>
          <p className="text-gray-600">
            Test and troubleshoot push notifications for PodCastify
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Regular Notification Manager */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Notification Manager</h2>
            <NotificationManager />
          </div>

          {/* Troubleshooter */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Troubleshooter</h2>
            <NotificationTroubleshooter />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Common Issues & Solutions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-2">
                🚫 Notifications are blocked
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  Use the troubleshooter to get browser-specific instructions
                </li>
                <li>
                  Look for a blocked notification icon in your address bar
                </li>
                <li>
                  Go to browser settings → Privacy & Security → Notifications
                </li>
                <li>Remove this site from the blocked list</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">
                ⏳ Stuck on "Processing..."
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Wait 30-60 seconds for the process to complete</li>
                <li>Check your internet connection</li>
                <li>Try refreshing the page and attempting again</li>
                <li>Use the "Reset & Try Again" button</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">
                🔄 Service Worker Issues
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Open browser developer tools (F12)</li>
                <li>Go to Application → Service Workers</li>
                <li>Unregister any existing service workers for this site</li>
                <li>Refresh the page and try again</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-2">🧹 Complete Reset</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Use the "Reset Everything" button in the troubleshooter</li>
                <li>Clear all browser data for this site</li>
                <li>Close and reopen your browser</li>
                <li>Visit the site again and set up notifications fresh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
