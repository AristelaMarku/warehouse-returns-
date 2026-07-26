import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { supervisorGuard } from './core/auth/supervisor.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'rmas', pathMatch: 'full' },
      {
        path: 'rmas',
        loadComponent: () =>
          import('./features/rma-list/rma-list.component').then((m) => m.RmaListComponent),
      },
      {
        path: 'rmas/:id',
        loadComponent: () =>
          import('./features/rma-detail/rma-detail.component').then((m) => m.RmaDetailComponent),
      },
      {
        path: 'rmas/:id/receive',
        loadComponent: () =>
          import('./features/receive-device/receive-device.component').then(
            (m) => m.ReceiveDeviceComponent,
          ),
      },
      {
        path: 'receipts',
        canActivate: [supervisorGuard],
        loadComponent: () =>
          import('./features/receipts-list/receipts-list.component').then(
            (m) => m.ReceiptsListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
