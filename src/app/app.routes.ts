import {Routes,RouterModule} from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import {MainComponent} from './pages/main';
import {StatisticsComponent} from './pages/statistics';
import {AboutUsComponent} from './pages/aboutus';
import {WhatWeDoComponent} from './pages/whatwedo';
import {HowItWorksComponent} from './pages/howitworks';

export const routes:Routes = [
    {path: '', component: MainComponent},
    {path: 'statistics', component: StatisticsComponent},
    {path: 'aboutus', component: AboutUsComponent},
    {path: 'whatwedo', component: WhatWeDoComponent},
    {path: 'howitworks', component: HowItWorksComponent},
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);