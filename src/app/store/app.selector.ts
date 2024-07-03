import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.reducer';

export const state = createFeatureSelector<AppState>('App');

export const selectLoadingStatus = createSelector(
  state,
  (state: AppState) => state.isLoading
);

export const selectTaskLoadingStatus = createSelector(
  state,
  (state: AppState) => state.tasksLoadingFlag
);

export const selectCurrentUser = createSelector(
  state,
  (state: AppState) => state.user
);

export const selectProjectTaskList = createSelector(
  state,
  (state: AppState) => state.projectTaskList
);

export const selectCurrentProject = createSelector(
  state,
  (state: AppState) => state.currentProject
);

export const getProjectTaskList = (projectId: string) =>
  createSelector(state, (state: AppState) =>
    state.projectTaskList.filter((obj) => obj.projectId === projectId)
  );
