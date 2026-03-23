import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShellClient } from "@/src/components/sections/admin/admin-shell-client";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/src/lib/admin-auth";

type Props = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const cookieStore = await cookies();
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-app">
      <AdminShellClient userEmail={session.email}>
        {children}
      </AdminShellClient>
    </div>
  );
}
