"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  color: string;
  assignee: string;
}

export interface GanttMilestone {
  id: string;
  name: string;
  date: string;
  color: string;
}

export interface GanttChartProps {
  timeline: {
    start: string;
    end: string;
    granularity?: "week" | "month";
  };
  tasks: GanttTask[];
  milestones: GanttMilestone[];
  currentDate: string;
  onTaskClick?: (task: GanttTask) => void;
}

export function GanttChart({
  timeline,
  tasks,
  milestones,
  currentDate,
  onTaskClick,
}: GanttChartProps) {
  const [hoveredTask, setHoveredTask] = React.useState<string | null>(null);

  const startDate = new Date(timeline.start);
  const endDate = new Date(timeline.end);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const today = new Date(currentDate);
  const todayOffset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const getTaskPosition = (taskStart: string, taskEnd: string) => {
    const start = new Date(taskStart);
    const end = new Date(taskEnd);
    const offset = Math.ceil((start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return { offset, duration };
  };

  const getMilestonePosition = (date: string) => {
    const milestoneDate = new Date(date);
    return Math.ceil((milestoneDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const generateWeekLabels = () => {
    const labels: string[] = [];
    const weeks = Math.ceil(totalDays / 7);
    for (let i = 0; i < weeks; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i * 7);
      labels.push(weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }
    return labels;
  };

  const weekLabels = generateWeekLabels();
  const weeks = Math.ceil(totalDays / 7);
  const dayWidth = 720 / totalDays;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Timeline</CardTitle>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Expand
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Timeline Header */}
          <div className="flex border-b border-border/40 pb-2">
            <div className="w-32 shrink-0" />
            <div className="flex-1 flex">
              {weekLabels.map((label, i) => (
                <div
                  key={i}
                  className="flex-1 text-xs text-muted-foreground text-center pr-1"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Today Indicator Line */}
          {todayOffset >= 0 && todayOffset <= totalDays && (
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-red-500 z-10"
                style={{ left: `${32 + (todayOffset * dayWidth)}px` }}
              />
              <div
                className="absolute -top-6 -translate-x-1/2 text-xs text-red-500 font-medium"
                style={{ left: `${32 + (todayOffset * dayWidth)}px` }}
              >
                Today
              </div>
            </div>
          )}

          {/* Tasks */}
          <div className="space-y-2 pl-2">
            {tasks.map((task, index) => {
              const { offset, duration } = getTaskPosition(task.start, task.end);
              const leftPosition = (offset / totalDays) * 100;
              const widthPercent = (duration / totalDays) * 100;

              return (
                <div
                  key={task.id}
                  className="relative group flex items-center gap-3 h-10"
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  {/* Task Name */}
                  <div className="w-32 shrink-0 text-xs font-medium text-foreground truncate pr-2">
                    {task.name}
                  </div>

                  {/* Task Bar */}
                  <div className="flex-1 relative h-6">
                    <button
                      type="button"
                      onClick={() => onTaskClick?.(task)}
                      className={cn(
                        "absolute h-6 rounded-md flex items-center gap-2 px-2 text-xs font-medium transition-all",
                        hoveredTask === task.id && "ring-2 ring-ring ring-offset-1"
                      )}
                      style={{
                        left: `${leftPosition}%`,
                        width: `${Math.max(widthPercent, 3)}%`,
                        backgroundColor: task.color,
                        color: "#ffffff",
                      }}
                    >
                      {/* Progress Bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-black/20 rounded-l-md"
                        style={{ width: `${100 - task.progress}%` }}
                      />
                      <span className="relative z-10 truncate">{task.progress}%</span>
                    </button>

                    {/* Assignee Badge */}
                    {hoveredTask === task.id && (
                      <div className="absolute left-0 -bottom-1 z-20">
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          {task.assignee}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="relative pt-2 border-t border-border/40">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Milestones
              </div>
              {milestones.map((milestone) => {
                const position = getMilestonePosition(milestone.date);
                const leftPercent = (position / totalDays) * 100;

                return (
                  <div
                    key={milestone.id}
                    className="absolute top-6 group"
                    style={{ left: `${leftPercent}%` }}
                  >
                    {/* Diamond Shape */}
                    <div
                      className="w-4 h-4 rotate-45 transform -translate-x-1/2 cursor-pointer transition-transform group-hover:scale-125"
                      style={{ backgroundColor: milestone.color }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      <div className="bg-popover border border-border rounded px-2 py-1 text-xs shadow-md">
                        <div className="font-medium">{milestone.name}</div>
                        <div className="text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-500" />
              <span className="text-xs text-muted-foreground">Not Started</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rotate-45 bg-red-500" />
              <span className="text-xs text-muted-foreground">Milestone</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
