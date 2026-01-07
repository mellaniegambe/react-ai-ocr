import { Outlet, Link } from "react-router";
import { ScanText } from "lucide-react";

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and App Title */}
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ScanText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">OCR</span>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-1">
              <Link
                to="/"
                className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/history"
                className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium"
              >
                History
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
