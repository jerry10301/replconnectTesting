import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Loader2, 
  History, 
  LogIn, 
  LogOut, 
  UserPlus, 
  UserCog, 
  UserMinus, 
  KeyRound,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLog, ActionType } from "@shared/schema";

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

const actionIcons: Record<ActionType, typeof LogIn> = {
  login: LogIn,
  logout: LogOut,
  create_user: UserPlus,
  update_user: UserCog,
  delete_user: UserMinus,
  password_reset_request: KeyRound,
  password_reset_complete: KeyRound,
  profile_update: User,
  password_change: KeyRound,
};

const actionLabels: Record<ActionType, string> = {
  login: "Login",
  logout: "Logout",
  create_user: "Create User",
  update_user: "Update User",
  delete_user: "Delete User",
  password_reset_request: "Password Reset Request",
  password_reset_complete: "Password Reset Complete",
  profile_update: "Profile Update",
  password_change: "Password Change",
};

const actionVariants: Record<ActionType, "default" | "secondary" | "destructive" | "outline"> = {
  login: "default",
  logout: "secondary",
  create_user: "default",
  update_user: "secondary",
  delete_user: "destructive",
  password_reset_request: "outline",
  password_reset_complete: "default",
  profile_update: "secondary",
  password_change: "outline",
};

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery<AuditLogsResponse>({
    queryKey: [`/api/audit-logs?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`],
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-audit-logs-title">
          Audit Logs
        </h1>
        <p className="text-muted-foreground">
          Track all system activities and user actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription>
                {data?.total || 0} total events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data?.logs && data.logs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[120px]">Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => {
                    const ActionIcon = actionIcons[log.action];
                    return (
                      <TableRow key={log.id} data-testid={`audit-log-row-${log.id}`}>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={actionVariants[log.action]}
                            className="gap-1"
                          >
                            <ActionIcon className="h-3 w-3" />
                            {actionLabels[log.action]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.actorName}
                        </TableCell>
                        <TableCell>
                          {log.targetName || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {log.details || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, data.total)} of {data.total} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No activity yet</h3>
              <p className="text-sm text-muted-foreground">
                System activities will appear here as users perform actions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
