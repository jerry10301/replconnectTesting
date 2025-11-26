import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, ShieldCheck, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

interface DashboardStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  loading,
  testId,
}: { 
  title: string; 
  value: number | string; 
  description: string; 
  icon: typeof Users;
  loading?: boolean;
  testId: string;
}) {
  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-3xl font-bold" data-testid={testId}>{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, token } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAdmin && !!token,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-medium text-foreground">{user?.name}</span>
        </p>
      </div>

      {isAdmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              description="All registered users"
              icon={Users}
              loading={isLoading}
              testId="stat-total-users"
            />
            <StatCard
              title="Administrators"
              value={stats?.adminUsers ?? 0}
              description="Users with admin role"
              icon={ShieldCheck}
              loading={isLoading}
              testId="stat-admin-users"
            />
            <StatCard
              title="Regular Users"
              value={stats?.regularUsers ?? 0}
              description="Users with user role"
              icon={UserCheck}
              loading={isLoading}
              testId="stat-regular-users"
            />
            <StatCard
              title="Recent Signups"
              value={stats?.recentUsers ?? 0}
              description="Last 7 days"
              icon={Clock}
              loading={isLoading}
              testId="stat-recent-users"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <a
                  href="/users"
                  className="group flex items-center gap-4 p-4 rounded-lg border border-border/60 hover-elevate transition-all"
                  data-testid="link-manage-users"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Users</h3>
                    <p className="text-sm text-muted-foreground">Add, edit, or remove users</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the System</CardTitle>
            <CardDescription>You are logged in as a regular user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Your Account</h3>
                <p className="text-sm text-muted-foreground">
                  Role: <span className="capitalize font-medium">{user?.role}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Email: {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
