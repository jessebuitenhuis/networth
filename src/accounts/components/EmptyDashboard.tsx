import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyDashboardProps {
  createAccountTrigger: React.ReactNode;
}

export function EmptyDashboard({ createAccountTrigger }: EmptyDashboardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="surface-hero relative px-8 py-12 text-center">
        <div className="surface-hero-glow-center pointer-events-none absolute inset-0" />
        <div className="relative space-y-4">
          <div className="empty-icon mx-auto flex size-14 items-center justify-center rounded-2xl">
            <span className="font-display text-2xl text-primary">$</span>
          </div>
          <CardHeader className="p-0">
            <CardTitle className="font-display text-2xl font-normal">
              Welcome to Net Worth Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-0">
            <p className="text-muted-foreground">
              Create your first account to start tracking your net worth
            </p>
            {createAccountTrigger}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
