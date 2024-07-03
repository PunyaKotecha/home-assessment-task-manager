export interface ITaskObject {
  count: number;
  tasks: ITask[];
}

export interface ProjectTaskState {
  id: string;
  status: string;
  description: string;
  loading?: boolean;
  slug: string;
  expanded?: boolean;
  checklists: any;
}

export interface ITask extends ProjectTaskState {
  name: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  expectedStartDate?: string | Date | null;
  expectedEndDate?: string | Date | null;
  created: string;
  updated: string;

  projectId: string;
  assignee: { id: string; username: string };
  createdBy: { id: string; username: string };

  parent?: {
    id: string;
    name: string;
  };
  children?: ITask[];
  hasChildren: boolean;
  hasChecklist: boolean;
  hasAttachment: boolean;
  hasIncompleteChecklist: boolean;
  displayId: string;

  tags: any[] | [];
  autoCreate?: {
    count: number;
    templateId?: string;
  };
  attachments: any[] | [];
  priority?: string;

  plannedQuantity?: number;
  actualQuantity?: number;
  unit?: string;

  attachmentRequired?: boolean;
  isTemplate?: boolean;
  saveAsTemplateFlag?: boolean;
  hasDeletedAttachment?: boolean;
  localOrder: number;
}

export interface ITaskHistory {
  entries: ITaskHistoryEntry[] | [];
}

export interface ITaskHistoryEntry {
  id: string;
  historyId: string;
  fieldName: string;
  action: string;
  oldValue: any;
  newValue: any;
  modifiedAt: Date;
  modifiedBy: { id: string; name: string };
  task: string;
}

export interface IProjectState {
  id: string;
  name: string;
  description?: string;
  slug: string;
  displayId?: string;
  shortName?: string;
}

export interface UserState {
  id: string;
  firstName: string;
  lastName: string;
  email: string;

  created: string;
  username: string;

  isSuperUser?: boolean;
  slug: any;
}

export interface Column {
  field: string;
  header: string;
  key: string;
}
