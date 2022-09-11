import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserComponent } from './user/user.component';
import { RideComponent } from './ride/ride.component';
import { AdminComponent } from './admin.component';
import { ConfigComponent } from './config/config.component';
import { ActivityComponent } from './activity/activity.component';

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
      {
        path: 'activity',
        component: ActivityComponent,
      },
      {
        path: 'config',
        component: ConfigComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
