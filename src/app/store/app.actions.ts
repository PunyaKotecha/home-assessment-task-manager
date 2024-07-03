import { createAction, props } from '@ngrx/store';
import { TASK_STATUS } from '../components/models_and_dtos/enum';

export const getCurrentUser = createAction('[App] Get Current User');

export const loadTasksByProjectId = createAction(
  '[App] Load Tasks By Project ID',
  props<{ projectId: string; refresh?: boolean }>()
);

export const loadTasksByProjectIdSuccess = createAction(
  '[App] Load Tasks By Project ID Success',
  props<{ projectId: string; projectTaskList: any[] }>()
);

export const loadTasksByProjectIdFailure = createAction(
  '[App] Load Tasks By Project ID Failure',
  props<{ error: string }>()
);

export const toggleTaskExpanded = createAction(
  '[App] Toggle Task Expanded',
  props<{ projectId: string; taskId: string; expanded: boolean }>()
);

export const patchTaskStatus = createAction(
  '[App] Patch Task Status',
  props<{
    projectId: string;
    taskId: string;
    updatedStatus: TASK_STATUS;
    oldStatus: TASK_STATUS;
  }>()
);

export const patchTaskStatusSuccess = createAction(
  '[App] Patch Task Status Success',
  props<{ projectId: string; taskId: string; updatedStatus: TASK_STATUS }>()
);

export const patchTaskStatusFailure = createAction(
  '[App] Patch Task Status Failure',
  props<{ projectId: string; taskId: string; oldStatus: TASK_STATUS }>()
);

export const deleteTasks = createAction(
  '[App] Delete Tasks',
  props<{ tasks: string[] }>()
);

export const deleteTasksSuccess = createAction(
  '[App] Delete Tasks Success',
  props<{ tasks: string[] }>()
);

export const deleteTasksFailure = createAction(
  '[App] Delete Tasks Failure',
  props<{ error: string }>()
);
