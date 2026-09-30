To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview](https://angular.io/cli) page.

## Vercel API deployment

Set the Vercel project root directory to `App` so Vercel deploys `api/departments.js` and `api/roles.js` alongside the Angular app. Add these environment variables in the Vercel project settings for every deployment environment:

- `DB_SERVER`: Azure SQL server hostname
- `DB_DATABASE`: database name
- `DB_USER`: database username
- `DB_PASSWORD`: database password
- `DB_PORT`: `1433` (optional)
- `DB_TRUST_SERVER_CERTIFICATE`: `false` (optional)

Redeploy after adding or changing environment variables. Keep database credentials out of Angular code and source control.
# App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

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
