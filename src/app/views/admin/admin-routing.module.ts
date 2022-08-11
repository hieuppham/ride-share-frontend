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
  },
  {
    path: 'user',
    component: UserComponent,
    data: {
      title: `Ride`,
    },
  },
  {
    path: 'ride',
    component: RideComponent,
    data: {
      title: `Ride`,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
