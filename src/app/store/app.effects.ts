import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TaskService } from '../services/task.service';
import { Store, select } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, of, tap, withLatestFrom } from 'rxjs';
import { selectProjectTaskList } from './app.selector';
import { ITask, ITaskObject } from '../components/models_and_dtos/models';
import {
  deleteTasks,
  deleteTasksFailure,
  deleteTasksSuccess,
  loadTasksByProjectId,
  loadTasksByProjectIdFailure,
  loadTasksByProjectIdSuccess,
  patchTaskStatus,
  patchTaskStatusFailure,
  patchTaskStatusSuccess,
} from './app.actions';
import {
  GlobalConstants,
  TASK_STATUS,
} from '../components/models_and_dtos/enum';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private taskService: TaskService,
    private store: Store,
    private messageService: MessageService,
    private router: Router
  ) {}
  /**
   * Load list of tasks for project
   * Check cache
   */
  loadTasksByProjectId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTasksByProjectId),
      withLatestFrom(this.store.pipe(select(selectProjectTaskList))),
      mergeMap(([action, existingList]) => {
        // Check if mapping for this project exists in store
        const cachedList = existingList.find(
          (listobj) => listobj.projectId === action.projectId
        );

        // Take value from cache if exists and refresh flag is false
        if (cachedList !== undefined && !action.refresh) {
          return of(
            loadTasksByProjectIdSuccess({
              projectTaskList: cachedList.tasksList,
              projectId: action.projectId,
            })
          );
        }
        return this.taskService.getTasksByProjectId(action.projectId).pipe(
          map((res: ITaskObject) => {
            res?.tasks?.map((task) => (task.loading = false));
            res?.tasks?.map((task) => (task.expanded = false));

            return loadTasksByProjectIdSuccess({
              projectTaskList: res.tasks,
              projectId: action.projectId,
            });
          }),
          catchError(() => {
            return of(
              loadTasksByProjectIdFailure({ error: 'Error fetching tasks' })
            );
          })
        );
      })
    )
  );

  /**
   * Load tasks by project failure
   */
  loadTasksByProjectIdFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadTasksByProjectIdFailure),
        tap((action) =>
          this.messageService.add({
            severity: 'error',
            detail: action.error,
          })
        )
      ),
    { dispatch: false }
  );

  patchTaskStatus$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(patchTaskStatus),
        mergeMap((action) =>
          this.taskService
            .updateTaskStatus(action.taskId, action.updatedStatus)
            .pipe(
              map((updatedTask: ITask) => {
                return this.store.dispatch(
                  patchTaskStatusSuccess({
                    projectId: action.projectId,
                    taskId: updatedTask.id,
                    updatedStatus: updatedTask.status as TASK_STATUS,
                  })
                );
              }),
              catchError((error) => {
                this.messageService.add({
                  detail: error,
                  severity: 'error',
                  life: 5000,
                });
                return of(
                  this.store.dispatch(
                    patchTaskStatusFailure({
                      taskId: action.taskId,
                      projectId: action.projectId,
                      oldStatus: action.oldStatus,
                    })
                  )
                );
              })
            )
        )
      ),
    { dispatch: false }
  );

  /**
   * Delete task
   */
  deleteTask$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(deleteTasks),
        mergeMap((action) =>
          this.taskService.batchDeleteTasks(action.tasks).pipe(
            map(() => {
              this.store.dispatch(deleteTasksSuccess({ tasks: action.tasks }));
            }),
            catchError((error) =>
              of(this.store.dispatch(deleteTasksFailure({ error: error })))
            )
          )
        )
      ),
    { dispatch: false }
  );

  deleteTaskSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(deleteTasksSuccess),
        mergeMap((action) => {
          let taskDeleteDetail = '';
          action.tasks.forEach((task) => {
            taskDeleteDetail = taskDeleteDetail.concat(task + ',\n');
          });

          this.messageService.add({
            severity: 'success',
            detail: `Above tasks have been deleted successfully`,
            summary: taskDeleteDetail,
            life: 5000 * 2,
          });

          return of(
            this.store.dispatch(
              loadTasksByProjectId({
                projectId: GlobalConstants.PROJECT_ID,
                refresh: true,
              })
            )
          );
        })
      ),
    { dispatch: false } // This effect does not dispatch any new actions
  );
}
