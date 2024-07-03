import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { TreeTable } from 'primeng/treetable';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  combineLatest,
  debounceTime,
  distinct,
  distinctUntilChanged,
  filter,
  map,
  of,
  takeUntil,
} from 'rxjs';
import { NodeService } from 'src/app/services/node.service';
import { TaskService } from 'src/app/services/task.service';
import { patchTaskStatus, toggleTaskExpanded } from 'src/app/store/app.actions';
import {
  getProjectTaskList,
  selectLoadingStatus,
  selectTaskLoadingStatus,
} from 'src/app/store/app.selector';
import { TASK_STATUS } from '../models_and_dtos/enum';
import { Column, ITask, ITaskObject } from '../models_and_dtos/models';

@Component({
  selector: 'app-task-tree',
  templateUrl: './task-tree.component.html',
  styleUrls: ['./task-tree.component.scss'],
})
export class TaskTreeComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  userRole$: Observable<any>;

  @Input()
  searchTerm: string;

  @Output()
  taskSelectionChange: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('taskTree')
  treeTable: TreeTable;

  @ViewChild('taskOptionsContext')
  taskOptionsContext: ContextMenu;

  @ViewChild('context')
  taskStatusContext: ContextMenu;

  @Input()
  projectId: any = '';

  projectTaskList$: Observable<any>;
  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  columns: Column[];

  treeData: TreeNode[] = [];
  treeDataBackup: any[] = [];
  selectedNodes!: any;
  linearTasksList: any[];

  selectedContextNode!: TreeNode;
  currentProjectUsers: any[];
  currentTaskId: string;
  selectedDuplicationTask: any;

  taskStatusList: MenuItem[] = [
    {
      label: TASK_STATUS.NotStarted,
      icon: 'pi pi-fw pi-angle-double-right',
      iconClass: 'context-status-not-started',
      iconStyle: { color: '' },
      command: () =>
        this.updateTaskStatus(this.selectedContextNode, TASK_STATUS.NotStarted),
    },
    {
      label: TASK_STATUS.Open,
      icon: 'pi pi-fw pi-circle',
      iconClass: 'context-status-open',
      iconStyle: { color: '#0e8bdf' },
      command: () =>
        this.updateTaskStatus(this.selectedContextNode, TASK_STATUS.Open),
    },
    {
      label: TASK_STATUS.InProgress,
      icon: 'pi pi-fw pi-clock',
      iconClass: 'context-status-in-progress',
      iconStyle: { color: '#e5b112' },
      command: () =>
        this.updateTaskStatus(this.selectedContextNode, TASK_STATUS.InProgress),
    },
    {
      label: TASK_STATUS.OnHold,
      icon: 'pi pi-fw pi-pause',
      iconClass: 'context-status-on-hold',
      iconStyle: { color: '#f97316' },
      command: () =>
        this.updateTaskStatus(this.selectedContextNode, TASK_STATUS.OnHold),
    },
    {
      label: TASK_STATUS.Resolved,
      icon: 'pi pi-fw pi-verified',
      iconClass: 'context-status-resolved',
      iconStyle: { color: '#00bf00' },
      command: () =>
        this.updateTaskStatus(this.selectedContextNode, TASK_STATUS.Resolved),
    },
    {
      label: TASK_STATUS.Closed,
      icon: 'pi pi-fw pi-circle-fill',
      iconClass: 'context-status-closed',
      iconStyle: { color: '#f34242' },
      command: () =>
        this.updateTaskStatus(this.selectedContextNode, TASK_STATUS.Closed),
    },
  ];
  loader$: Observable<any>;
  loaderOverride = false;

  private searchTerms$ = new Subject<string>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private location: Location,
    private nodeService: NodeService,
    private taskService: TaskService,
    private cd: ChangeDetectorRef,
    private message: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Detect changes in searchTerm
    if (changes['searchTerm']) {
      this.searchTerms$.next(changes['searchTerm']['currentValue']);
    }
  }

  ngOnInit(): void {
    this.loader$ = combineLatest([
      this.store.pipe(select(selectLoadingStatus)),
      this.store.pipe(select(selectTaskLoadingStatus)),
    ]).pipe(
      map(
        ([loadingStatus, taskLoadingStatus]) =>
          loadingStatus || taskLoadingStatus
      ),
      takeUntil(this.ngUnsubscribe$)
    );

    this.columns = [
      {
        field: 'displayId',
        header: 'ID',
        key: 'displayId',
      },
      {
        field: 'name',
        header: 'Name',
        key: 'name',
      },
      {
        field: 'status',
        header: 'Status',
        key: 'status',
      },
      {
        field: 'e_start_date',
        header: 'Estd. Start date',
        key: 'e_start_date',
      },
      {
        field: 'e_end_date',
        header: 'Estd. End date',
        key: 'e_end_date',
      },

      {
        field: 'start_date',
        header: 'Start date',
        key: 'start_date',
      },
      {
        field: 'end_date',
        header: 'End date',
        key: 'end_date',
      },
      {
        field: 'assigned_to',
        header: 'Assigned to',
        key: 'assigned_to',
      },
    ];

    this.currentProjectUsers = [
      { username: 'Punya' },
      { username: 'Pesto Reviewer' },
    ];

    // Fetch Tasks and Current Project Users
    this.projectTaskList$ = this.store.pipe(
      takeUntil(this.ngUnsubscribe$),
      select(getProjectTaskList(this.projectId)),
      filter((ptl) => ptl.length > 0),
      distinct()
    );

    this.projectTaskList$.subscribe((ptl) => {
      if (ptl.length > 0) {
        this.linearTasksList = ptl[0].tasksList;

        // Create Tree data
        this.treeData = [
          ...this.nodeService.buildTreeTable(this.linearTasksList),
        ];
        this.treeDataBackup = [...this.treeData];
        this.selectedNodes = [];

        // Detect changes manually
        setTimeout(() => {
          this.cd.detectChanges();
        });
      } else {
        this.treeData = [];
      }
    });

    // Search From Tree
    this.searchTerms$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe((term: string) => {
        let searchResult$: Subscription = new Subscription();

        if (term === '') {
          this.treeData = [...this.treeDataBackup];
          // Detect changes manually
          this.cd.detectChanges();

          // Unsubscribe
          searchResult$?.unsubscribe();
        } else {
          this.loaderOverride = true;
          // Detect changes manually
          this.cd.detectChanges();

          searchResult$ = this.searchAndCreateTreeFromLocalState(term)
            .pipe(
              map((res) => {
                this.treeData = [...res];
                this.loaderOverride = false;

                // Detect changes manually
                this.cd.detectChanges();
              }),

              catchError(() => {
                this.loaderOverride = false;

                // Detect changes manually
                this.cd.detectChanges();
                return of();
              })
            )
            .subscribe();
        }
      });
  }

  /**
   * Open View/Edit Task Dialog
   * @param e Row selected event
   */
  // openSelectedTask = (
  //   event: any,
  //   e: any,
  //   edit: boolean,
  //   col?: number,
  //   activeTab?: any
  // ) => {
  //   if ((col && (col === 7 || col === 2)) || e.node.data.loading) {
  //     event.stopImmediatePropagation();
  //     return;
  //   }

  //   if (col === 0) {
  //     event.stopPropagation();
  //   }

  //   this.currentTaskId = e.node.data.slug;
  //   this.location.replaceState(
  //     `/project/${this.projectId}/dashboard/task/${this.currentTaskId}#allTasks`
  //   );

  //   this.dialogRef = this.dialogService.open(ViewEditTaskModalComponent, {
  //     width: '60%',
  //     baseZIndex: 10000,
  //     closable: false,
  //     data: {
  //       projectId: this.projectId,
  //       taskId: this.currentTaskId,
  //       editMode: edit,
  //       activeTab: activeTab,
  //     },
  //   });

  //   this.isDialogOpen = true;

  //   // On dialog close
  //   this.dialogRef.onClose.subscribe(() => {
  //     // Restore last URL location
  //     this.location.replaceState(
  //       `/project/${this.projectId}/dashboard#allTasks`
  //     );

  //     this.isDialogOpen = false;
  //   });
  // };

  /**
   * Assign class to task status column
   * @param status status
   * @returns class string
   */
  taskStatusClass = (status: string): string => {
    switch (status) {
      case TASK_STATUS.NotStarted:
        return 'status-not-started';

      case TASK_STATUS.Open:
        return 'status-open';

      case TASK_STATUS.InProgress:
        return 'status-in-progress';

      case TASK_STATUS.OnHold:
        return 'status-on-hold';

      case TASK_STATUS.Resolved:
        return 'status-resolved';

      case TASK_STATUS.Closed:
        return 'status-closed';

      default:
        return 'status-open';
    }
  };

  // /**
  //  * Update task assignee
  //  * @param e Dropdown selection event
  //  * @param previous Previous assignee
  //  * @param row Row object
  //  */
  // updateTaskAsignee = (e: any, previous: any, row: any) => {
  //   if (e !== null && e.id !== previous.id) {
  //     this.store.dispatch(
  //       patchTaskAsignee({
  //         taskId: row.slug,
  //         updatedAssignee: e.id !== undefined ? e : {},
  //         projectId: this.projectId,
  //         taskName: row.name,
  //       })
  //     );
  //   }

  //   // If reset, pass null
  //   if (e === null) {
  //     this.store.dispatch(
  //       patchTaskAsignee({
  //         taskId: row.slug,
  //         updatedAssignee: { id: null },
  //         projectId: this.projectId,
  //         taskName: row.name,
  //       })
  //     );
  //   }
  // };

  /**
   * Row expand event
   * @param e event obj
   * @param value row value
   */
  rowExpand = (e: any) => {
    if (e.node.children) {
      const children = this.nodeService.buildTreeTableNodeChildren(
        this.linearTasksList,
        e.node.data.id
      );
      e.node.children = [...children];

      this.store.dispatch(
        toggleTaskExpanded({
          projectId: this.projectId,
          taskId: e.node.data.slug,
          expanded: true,
        })
      );
    }
  };

  /**
   * Row collapse event
   * @param e event obj
   * @param value row value
   */
  rowCollapse = (e: any) => {
    e.originalEvent.stopPropagation();
    e.node.children = [];

    this.store.dispatch(
      toggleTaskExpanded({
        projectId: this.projectId,
        taskId: e.node.data.slug,
        expanded: false,
      })
    );
  };

  /**
   * Row checkbox click event
   * @param e Event
   */
  treeTableCheckboxClick = (e: Event) => {
    // Prevent Task Open on selecting checkbox
    e.stopPropagation();
  };

  /**
   * Update the task status
   * @param row row data object
   */
  updateTaskStatus = (row: any, updatedStatus: TASK_STATUS) => {
    if (row.data.status === updatedStatus) {
      return;
    }

    // Update task status
    this.store.dispatch(
      patchTaskStatus({
        projectId: this.projectId,
        taskId: row.data.slug,
        updatedStatus: updatedStatus,
        oldStatus: this.selectedContextNode.data.status,
      })
    );
  };

  /**
   * Search from linear list of tasks and create tree view
   * @param term search term
   */
  searchAndCreateTreeFromLocalState = (term: string): Observable<any[]> => {
    const searchResult = this.linearTasksList.filter((data: any) =>
      data.name?.toLowerCase().includes(term.toLowerCase())
    );

    // Linear list
    const tasks: ITask[] = [...this.linearTasksList];

    let len = 0;
    let prevLen = 0;
    let searchResultsFinalList: ITask[] = [];

    // Find immediate parents of search result and append those to the list
    // Repeat the process until root level parents are encountered
    do {
      searchResultsFinalList = this.nodeService.findImmediateParentsFromList(
        tasks,
        searchResult
      );

      prevLen = len;
      searchResult.push(...searchResultsFinalList);
      len = searchResult.length;
    } while (len !== prevLen);

    const finalResponse = [
      ...this.nodeService.buildTreeTable(searchResult.reverse()),
    ];

    return of(finalResponse);
  };

  /**
   * Search from API query
   * @param term Search term
   * @returns search results
   */
  searchAndCreateTreeFromQuery = (term: string): Observable<any> => {
    return this.taskService.getTasksByProjectId(this.projectId, term).pipe(
      map((res: ITaskObject) => {
        const tasks = res.tasks.map((task: ITask) => ({
          ...task,
          expanded: true,
        }));
        return [...this.nodeService.buildTreeTable(tasks.reverse())];
      })
    );
  };

  /**
   * Left click context menu
   * @param e Event obj
   * @param row Tree row
   */
  taskRowLeftClickEvent = (e: any, row: any) => {
    this.selectedContextNode = row;
    this.taskStatusContext.show(e);
  };

  /**
   * Right click context menu
   * @param e event obj
   * @param col column
   * @param task task object
   */
  taskRowRightClickEvent = (e: any, col: any, task: any) => {
    // skip for status cell
    if (col && col === 2) {
      return;
    }
    this.selectedDuplicationTask = task;

    // open context menu
    this.taskOptionsContext.show(e);
  };

  ngOnDestroy(): void {
    // Unsubscribe everything
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
