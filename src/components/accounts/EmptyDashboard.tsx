import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyDashboardProps {
  createAccountTrigger: React.ReactNode;
}

export function EmptyDashboard({ createAccountTrigger }: EmptyDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Net Worth Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Create your first account to start tracking your net worth
        </p>
        {createAccountTrigger}
      </CardContent>
    </Card>
  );
}
