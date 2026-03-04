import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import { enterApp } from '/src/utils/helper.js';

export async function renderAdminDashboard() {
    enterApp();
    await Promise.all([
      loadSidebar(),
      loadTopbar(),
    ]);

    const response = await fetch('src/pages/user/admin/admin_dashboard/admin_dashboard.html');
    document.getElementById('content').innerHTML = await response.text();
}