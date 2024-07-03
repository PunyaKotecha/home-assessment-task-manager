# HomeAssessmentTaskManager

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.14.

This is a submission for Pesto Home Assessment.

## Contributor

- Punya Kotecha

## Install Dependencies

Run `yarn install`

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

Application uses an already developed Backend service. <br>
<b>Credentials:</b>
Credentials are hard-coded, except the password.
<b>Valid Password: </b> `Mars@2023`

## Features

- Task List in Tree View (Expand to reveal Child tasks)
- Task Batch Delete
- Task Status Update
- Task Search (Debounce implemented)
- Refresh button to update task list without reloading page

Owing to time constraints, I have not been able to develop Add/View feature for this task.

App will ask for password again when the User token expires

## Libraries / Packages used
- PrimeNG Components
- NGRX Store

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
