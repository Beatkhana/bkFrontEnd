import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TournamentsComponent } from './tournaments/tournaments.component';
import { TournamentComponent } from './tournament/tournament.component';
import { ArchiveComponent } from './archive/archive.component';


const routes: Routes = [
  {path: '', component: TournamentsComponent },
  {path: 'archive', component: ArchiveComponent },
  {path: 'tournament/:id', component: TournamentComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
