import { getCurrentUserAction } from "@/actions/user/get-current-user-action";
import { AdminDashboard } from "@/components/admin/admin-page";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const userData = await getCurrentUserAction();
  if (
    !userData.success ||
    !userData.data ||
    !userData.data.user_roles.some((role) => role.role_name === "Admin")
  ) {
    redirect("/");
  }
  return <AdminDashboard />;
}
