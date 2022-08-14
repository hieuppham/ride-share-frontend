import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserComponent } from './user/user.component';
import { RideComponent } from './ride/ride.component';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    data: {
      title: `Admin`,
    },
    children: [
      {
        path: 'user',
        component: UserComponent,
      },
      {
        path: 'ride',
        component: RideComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
