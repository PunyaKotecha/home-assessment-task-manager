import { createReducer, on } from '@ngrx/store';
import {
  IProjectState,
  ITask,
  UserState,
} from '../components/models_and_dtos/models';
import {
  deleteTasks,
  deleteTasksFailure,
  deleteTasksSuccess,
  loadTasksByProjectId,
  loadTasksByProjectIdSuccess,
  patchTaskStatus,
  patchTaskStatusSuccess,
  toggleTaskExpanded,
} from './app.actions';

export const appFeatureKey = 'app';

export interface AppState {
  user: UserState;
  isLoading: boolean;
  tasksLoadingFlag: boolean;
  projectDataLoadingFlag: boolean;
  projectTaskList: {
    projectId: string;
    tasksList: any[];
  }[];
  currentProject: IProjectState;
  currentProjectUsers: any[];
  error: string | null;
}

export const initialState: AppState = {
  isLoading: false,
  tasksLoadingFlag: false,
  projectDataLoadingFlag: false,
  user: {
    email: '',
    firstName: '',
    lastName: '',
    id: '',
    created: '',
    username: '',
    slug: '',
  },
  projectTaskList: [],
  currentProject: {
    id: '',
    slug: '',
    name: '',
    description: undefined,
    displayId: '000',
    shortName: undefined,
  },

  currentProjectUsers: [],
  error: null,
};

export const reducer = createReducer(
  initialState,

  on(loadTasksByProjectId, (state, action) => ({
    ...state,
    tasksLoadingFlag: true,
    isLoading: true,
  })),

  on(loadTasksByProjectIdSuccess, (state, action) => ({
    ...state,
    projectTaskList: [...createProjectTaskList(action, state)],
    tasksLoadingFlag: false,
    isLoading: false,
  })),

  on(toggleTaskExpanded, (state, action) => {
    const updatedProjectTaskList = state.projectTaskList.map((pt) =>
      pt.projectId === action.projectId
        ? {
            ...pt,
            tasksList: updateTaskExpandedProperty(
              pt.tasksList,
              action.taskId,
              action.expanded
            ),
          }
        : pt
    );

    return {
      ...state,
      projectTaskList: updatedProjectTaskList,
    };
  }),

  on(patchTaskStatus, (state, action) => {
    // Set relevant task loading flag to true
    const updatedProjectTaskList = state.projectTaskList.map((pt) =>
      pt.projectId === action.projectId
        ? {
            ...pt,
            tasksList: updateTaskStatus(
              pt.tasksList,
              action.taskId,
              action.updatedStatus
            ),
          }
        : pt
    );

    return {
      ...state,
      projectTaskList: updatedProjectTaskList,
    };
  }),

  on(patchTaskStatusSuccess, (state, action) => {
    // Set relevant task loading flag to false
    const updatedProjectTaskList = state.projectTaskList.map((pt) =>
      pt.projectId === action.projectId
        ? {
            ...pt,
            tasksList: updateTaskStatus(
              pt.tasksList,
              action.taskId,
              action.updatedStatus
            ),
          }
        : pt
    );

    return {
      ...state,
      projectTaskList: updatedProjectTaskList,
    };
  }),

  on(deleteTasks, (state, action) => ({
    ...state,
    isLoading: true,
    tasksLoadingFlag: true,
  })),

  on(deleteTasksSuccess, (state, action) => ({
    ...state,
    isLoading: false,
    tasksLoadingFlag: false,
  })),

  on(deleteTasksFailure, (state, action) => ({
    ...state,
    isLoading: false,
    tasksLoadingFlag: false,
  }))
);

function createProjectTaskList(action: any, state: AppState) {
  const temp = [];
  temp.push({
    projectId: action.projectId,
    tasksList: action.projectTaskList.map((task: any) => {
      const existingTask = state.projectTaskList
        .filter((ptl) => ptl.projectId === action.projectId)[0]
        ?.tasksList.find((t: ITask) => t.id === task.id);

      // Preserve expanded flag
      return { ...task, expanded: existingTask?.expanded };
    }),
  });
  return temp;
}

function updateTaskExpandedProperty(
  taskList: any[],
  taskId: string,
  expanded: boolean
): any {
  const taskIndex = taskList.findIndex((task) => task.slug === taskId);
  if (taskIndex === -1 || taskList[taskIndex].expanded === expanded) {
    // Return the same tasksList if no changes are needed
    return taskList;
  }

  const updatedTasksList = [...taskList];
  updatedTasksList[taskIndex] = {
    ...updatedTasksList[taskIndex],
    expanded,
  };

  return updatedTasksList;
}

function updateTaskStatus(
  taskList: any[],
  taskId: string,
  updatedStatus: any
): any {
  return taskList.map((task) => {
    if (task.slug === taskId) {
      return { ...task, status: updatedStatus, loading: false };
    } else {
      return task;
    }
  });
}
