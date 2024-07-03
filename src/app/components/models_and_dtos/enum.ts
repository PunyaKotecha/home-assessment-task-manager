export const enum TASK_STATUS {
  NotStarted = 'Not Started',
  Open = 'Open',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Resolved = 'Resolved',
  Closed = 'Closed',
}
export abstract class GlobalConstants {
  public static readonly PROJECT_ID: string = 'uiux-practice-project';
}
