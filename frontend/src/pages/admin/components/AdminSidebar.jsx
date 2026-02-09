import { X } from "lucide-react";

const AdminSidebar = ({
  activeTab,
  navItems,
  onNavigate,
  sidebarOpen,
  setSidebarOpen,
}) => (
  <>
    <aside className="hidden md:flex md:flex-col w-64 min-h-screen bg-white border-r border-gray-200 p-6 sticky top-0">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
          AO
        </div>
        <div>
          <p className="text-sm text-gray-500">Admin</p>
          <p className="font-bold text-gray-900">Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id, false)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              activeTab === item.id
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-50 to-blue-50 p-4">
        <p className="text-xs text-gray-600">System Status</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <p className="text-sm font-semibold text-gray-800">All services operational</p>
        </div>
      </div>
    </aside>

    {sidebarOpen && (
      <div className="fixed inset-0 z-40 md:hidden">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                AO
              </div>
              <div>
                <p className="text-sm text-gray-500">Admin</p>
                <p className="font-bold text-gray-900">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id, true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
      </div>
    )}
  </>
);

export default AdminSidebar;
