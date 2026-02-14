import type { Goal } from "@/goals/Goal.type";
import type { GoalProgress } from "@/models/GoalProgress.type";
import type { NetWorthDataPoint } from "@/models/NetWorthDataPoint.type";

function formatTimeRemaining(today: string, targetDate: string): string {
  const todayDate = new Date(today + "T00:00:00");
  const targetDateObj = new Date(targetDate + "T00:00:00");

  const yearDiff = targetDateObj.getFullYear() - todayDate.getFullYear();
  const monthDiff = targetDateObj.getMonth() - todayDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff;

  if (totalMonths >= 24) {
    const years = Math.round(totalMonths / 12);
    return `${years} years to go`;
  }

  if (totalMonths >= 12) {
    return "1 year to go";
  }

  if (totalMonths >= 2) {
    return `${totalMonths} months to go`;
  }

  if (totalMonths === 1) {
    return "1 month to go";
  }

  return "Less than a month to go";
}

export function computeGoalProgress(
  goals: Goal[],
  currentNetWorth: number,
  projectedSeries: NetWorthDataPoint[],
  today: string
): GoalProgress[] {
  return goals.map((goal) => {
    const percentage = Math.round(
      Math.min(
        100,
        Math.max(0, goal.targetAmount > 0 ? (currentNetWorth / goal.targetAmount) * 100 : 0)
      )
    );

    const isAchieved = currentNetWorth >= goal.targetAmount && goal.targetAmount > 0;

    let timeEstimate: string;
    if (isAchieved) {
      timeEstimate = "Achieved!";
    } else {
      const achievementPoint = projectedSeries.find((point) => point.netWorth >= goal.targetAmount);
      if (achievementPoint) {
        timeEstimate = formatTimeRemaining(today, achievementPoint.date);
      } else {
        timeEstimate = "Not projected within 50 years";
      }
    }

    return {
      goalId: goal.id,
      goalName: goal.name,
      targetAmount: goal.targetAmount,
      percentage,
      timeEstimate,
      isAchieved,
    };
  });
}
