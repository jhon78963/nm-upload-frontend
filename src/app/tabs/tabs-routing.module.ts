import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'images',
    component: TabsPage,
    children: [
      {
        path: 'categories',
        loadChildren: () => import('../tab-categories/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'products',
        loadChildren: () => import('../tab-products/tab-product.module').then(m => m.TabProductPageModule)
      },
      {
        path: 'users',
        loadChildren: () => import('../tab-users/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: '',
        redirectTo: '/images/products',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/images/products',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
