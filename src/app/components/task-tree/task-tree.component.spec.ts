import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTreeComponent } from './task-tree.component';

describe('TaskTreeComponent', () => {
  let component: TaskTreeComponent;
  let fixture: ComponentFixture<TaskTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskTreeComponent]
    });
    fixture = TestBed.createComponent(TaskTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
