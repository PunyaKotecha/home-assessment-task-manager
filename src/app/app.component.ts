import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  deleteTasks,
  getCurrentUser,
  loadTasksByProjectId,
} from './store/app.actions';
import { Subject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { TreeNode } from 'primeng/api';
import { GlobalConstants } from './components/models_and_dtos/enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    public router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private cookie: CookieService
  ) {}

  title = 'home-assessment-task-manager';
  projectId = GlobalConstants.PROJECT_ID;

  selectedTaskNodes: TreeNode[] = [];

  // Search
  searchTerm = '';
  private searchTerms$ = new Subject<string>();

  ngOnInit(): void {
    this.store.dispatch(loadTasksByProjectId({ projectId: this.projectId }));

    if (
      this.router.isActive('/login', true) ||
      window.location.pathname.includes('register/')
    ) {
    } else {
      this.store.dispatch(getCurrentUser());
    }
  }

  /**
   * Search tasks event
   */
  onTaskSearch = (term: string) => {
    this.searchTerm = term;
  };

  refreshTaskList = () => {
    this.store.dispatch(
      loadTasksByProjectId({ projectId: this.projectId, refresh: true })
    );
  };

  taskSelectionEvent = (e: any) => {
    this.selectedTaskNodes = e;
  };

  /**
   * Delete task
   */
  deleteConfirmation = () => {
    const confirm = window.confirm('Delete selected tasks?');

    if (confirm) {
      const tasksToDelete = this.selectedTaskNodes.map(
        (node: TreeNode) => node.data.slug
      );

      this.store.dispatch(deleteTasks({ tasks: tasksToDelete }));
    }
  };
}
