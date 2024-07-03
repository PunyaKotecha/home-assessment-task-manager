import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { InputTextModule } from 'primeng/inputtext';
import { TaskTreeComponent } from './components/task-tree/task-tree.component';
import { UserEffects } from './store/app.effects';
import { reducer } from './store/app.reducer';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaskService } from './services/task.service';
import { AuthInterceptService } from './services/auth-intercept.service';

export function initializeApp(
  taskService: TaskService,
  cookie: CookieService,
  message: MessageService
): () => Promise<void> {
  return async () => {
    if (cookie.get('AuthToken')) {
      message.add({
        severity: 'success',
        detail: 'Authenticated',
        life: 5000,
      });

      return Promise.resolve();
    } else {
      const email = 'punyax201@gmail.com';
      const password = window.prompt('Enter password');

      if (email && password) {
        await taskService.authenticate(email, password).toPromise();
      }
    }

    return Promise.resolve();
  };
}

@NgModule({
  declarations: [AppComponent, TaskTreeComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ToastModule,
    TreeTableModule,
    ButtonModule,
    TooltipModule,
    DropdownModule,
    ContextMenuModule,
    DividerModule,
    ToolbarModule,
    InputTextModule,
    ProgressSpinnerModule,

    StoreModule.forRoot({}),
    StoreModule.forFeature('App', reducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
    }),
    EffectsModule.forRoot([UserEffects]),
    HttpClientModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
  ],
  providers: [
    Store,
    HttpClient,
    MessageService,
    CookieService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [TaskService, CookieService, MessageService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
