import { loadAdminSidebar } from '/src/components/sidebar/admin_sidebar/admin_sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';

export async function renderAdminDashboard() {
    await Promise.all([
      loadAdminSidebar(),
      loadTopbar(),
    ]);

    const response = await fetch('src/pages/user/admin/admin_dashboard/admin_dashboard.html');
    document.getElementById('content').innerHTML = await response.text();
}