import { Injectable } from '@angular/core';
import { ITask } from '../components/models_and_dtos/models';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  constructor() {}

  /**
   * Build tree data for Tree table
   * @param taskList list of tasks
   * @returns tree nodes list
   */
  buildTreeTable = (taskList: ITask[]): TreeNode[] => {
    const nodes: TreeNode[] = [];

    taskList
      ?.filter((task) => !task.parent)
      .forEach((task) => {
        const node: TreeNode = {
          data: {
            assigned_to: {
              username: task.assignee?.username,
              id: task.assignee?.id,
              // slug: task.assignee?.,
              // name: task.assignee?.name,
            },
            e_end_date: task.expectedEndDate,
            e_start_date: task.expectedStartDate,
            start_date: task.startDate,
            end_date: task.endDate,
            displayId: task.displayId,
            id: task.id,
            name: task.name,
            status: task.status,
            slug: task.slug,
            loading: false, // You may set this based on your application logic
            // expanded: task.expanded,
            checklists: [], // task.checklists,
            checklistAlert: task.hasIncompleteChecklist,
            hasChildren: task.hasChildren,
            hasChecklist: task.hasChecklist,
            hasAttachment: task.hasAttachment,
            hasIncompleteChecklist: task.hasIncompleteChecklist,
            hasDeletedAttachment: task.hasDeletedAttachment,
            isHighlighted: false,
            isOrderHighlighted: false,
            localOrder: task.localOrder,
            parent: task.parent,
          },
          children: task.expanded
            ? this.buildTreeTableNodeChildren(taskList, task.id)
            : [],
          expanded: task.expanded,
        };

        nodes.push(node);
      });

    return nodes.sort((a, b) => a.data.localOrder - b.data.localOrder);
  };

  /**
   * Build children object for tree table node
   * @param taskList
   * @param parentId
   * @returns
   */
  buildTreeTableNodeChildren = (
    taskList: ITask[],
    parentId: string
  ): TreeNode[] => {
    const nodes: TreeNode[] = [];

    const childNodes = taskList?.filter(
      (task) => task.parent !== undefined && task.parent!.id === parentId
    );

    childNodes.map((task) => {
      const node: TreeNode = {
        data: {
          assigned_to: {
            username: task.assignee?.username,
            id: task.assignee?.id,
            // slug: task.assignee?.,
            // name: task.assignee?.name,
          },
          e_end_date: task.expectedEndDate,
          e_start_date: task.expectedStartDate,
          start_date: task.startDate,
          end_date: task.endDate,
          displayId: task.displayId,
          id: task.id,
          name: task.name,
          status: task.status,
          slug: task.slug,
          loading: false, // You may set this based on your application logic
          // expanded: task.expanded,
          checklists: [], // task.checklists,
          checklistAlert: task.hasIncompleteChecklist,
          hasChildren: task.hasChildren,
          hasChecklist: task.hasChecklist,
          hasAttachment: task.hasAttachment,
          hasIncompleteChecklist: task.hasIncompleteChecklist,
          hasDeletedAttachment: task.hasDeletedAttachment,
          isHighlighted: false,
          localOrder: task.localOrder,
          parent: task.parent,
        },
        children: task.expanded
          ? this.buildTreeTableNodeChildren(taskList, task.id)
          : [], // this.buildTreeTable(taskList, task.id),
        expanded: task.expanded,
      };

      nodes.push(node);
    });

    return nodes.sort((a, b) => a.data.localOrder - b.data.localOrder);
  };

  findImmediateParentsFromList = (
    linearList: ITask[],
    searchResults: ITask[]
  ): ITask[] => {
    const list = [];

    for (const task of linearList) {
      // Check if the task's ID matches any parent ID in the search results
      if (
        searchResults.findIndex((sl) => sl.id === task.id) === -1 &&
        searchResults.some((result) => result.parent?.id === task.id)
      ) {
        // If there's a match, add the task to the parents array
        list.push({ ...task, expanded: true });
      }
    }

    return list;
  };
}
