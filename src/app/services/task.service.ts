import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { RoutingTable } from '../components/models_and_dtos/routing';
import { CookieService } from 'ngx-cookie-service';
import { ITaskDto } from '../components/models_and_dtos/dto';
import { ITask, ITaskObject } from '../components/models_and_dtos/models';
import { TASK_STATUS } from '../components/models_and_dtos/enum';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient, private cookie: CookieService) {}

  authenticate = (email: string, password: string) => {
    const baseUrl = RoutingTable.getAuthUrl().toString();
    let endpoint = 'user/login/';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    const dto = {
      email: email,
      password: password,
    };

    return this.http.post(baseUrl + endpoint, dto, httpOptions).pipe(
      map((res: any) => {
        console.log(res);
        if (res.data['access']) {
          this.cookie.set('AuthToken', res.data['access']);
          this.cookie.set('RefreshToken', res.data['refresh']);
          this.cookie.set('RefreshToken', res.data['user']);
        }
      })
    );
  };

  getTasksByProjectId = (
    projectId: string,
    searchParam?: string
  ): Observable<any> => {
    const baseUrl = RoutingTable.getBaseUrl().toString();
    let endpoint = 'projects/{{projectId}}/tasks';
    endpoint = endpoint.replace('{{projectId}}', projectId);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.cookie.get('AuthToken'),
      }),
    };
    const params = new URLSearchParams();
    params.set('page-size', '0');

    if (searchParam) {
      params.set('search', searchParam);
    }
    endpoint = endpoint.concat('?' + params);

    return this.http.get<ITaskDto>(baseUrl + endpoint, httpOptions).pipe(
      map((res: any): ITaskObject => {
        return {
          count: res.count,
          tasks: res.data.map((task: ITaskDto) => this.mapTaskDtoToModel(task)),
        };
      })
    );
  };

  batchDeleteTasks = (tasks: any[]): Observable<any> => {
    const baseUrl = RoutingTable.getBaseUrl().toString();
    const endpoint = `tasks/batch-delete/`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.cookie.get('AuthToken'),
      }),
    };

    const dto = {
      tasks: tasks,
    };

    return this.http.post(baseUrl + endpoint, dto, httpOptions).pipe(
      map((res: any) => res),
      catchError((error: any) => throwError(error.error.message))
    );
  };

  /**
   * Patch task status
   * @param taskId task id
   * @param updatedStatus updated task status
   * @returns response object
   */
  updateTaskStatus = (
    taskId: string,
    updatedStatus: TASK_STATUS
  ): Observable<any> => {
    const baseUrl = RoutingTable.getBaseUrl().toString();
    const endpoint = `tasks/${taskId}/`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.cookie.get('AuthToken'),
      }),
    };

    const task = {
      status: updatedStatus,
    } as ITaskDto;

    return this.http.patch(baseUrl + endpoint, task, httpOptions).pipe(
      map((res: any) => this.mapTaskDtoToModel(res.data)),
      catchError((error: any) => throwError(error.error.errors.status[0]))
    );
  };

  /**
   * Convert Task Dto to Model
   * @param dto Task dto
   * @returns Task model
   */
  private mapTaskDtoToModel = (dto: ITaskDto): ITask => {
    return {
      id: dto.id,
      assignee: { id: dto.assignee?.id, username: dto.assignee?.username },
      children: [],
      hasChildren: dto.has_children,
      hasChecklist: dto.has_checklist,
      hasAttachment: dto.has_attachment,
      hasIncompleteChecklist: dto.has_incomplete_checklist,
      createdBy: dto.created_by,
      description: dto.description,
      displayId: dto.display_id,
      expectedEndDate: dto.expected_end_date,
      expectedStartDate: dto.expected_start_date,
      endDate: dto.actual_end_date,
      startDate: dto.actual_start_date,
      name: dto.name,
      projectId: dto.project?.id,
      slug: dto.slug,
      status: dto.status,
      tags: dto.tags,
      parent: dto.parent_task?.id
        ? { id: dto.parent_task?.id, name: dto.parent_task?.name }
        : undefined,
      updated: dto.updated_at,
      created: '',
      attachments: dto.attachments,
      isTemplate: dto.is_template,
      attachmentRequired: dto.attachment_required,
      hasDeletedAttachment: dto.has_deleted_attachment,
      localOrder: dto.local_order,
      checklists: [],
    };
  };
}
