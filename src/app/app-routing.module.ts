import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TournamentsComponent } from './tournaments/tournaments.component';
import { TournamentComponent } from './tournament/tournament.component';
import { ArchiveComponent } from './archive/archive.component';
import { RankingsComponent } from './rankings/rankings.component';
import { ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MapPoolComponent } from './map-pool/map-pool.component';
import { BracketComponent } from './bracket/bracket.component';


const routes: Routes = [
  {path: '', component: TournamentsComponent },
  {path: 'archive', component: ArchiveComponent },
  {path: 'ranking', component: RankingsComponent },
  {path: 'tournament/:id', component: TournamentComponent, children: [
    // {path: '', component: TournamentComponent, pathMatch: 'full'},
    {path: 'map-pool', component: MapPoolComponent},
    {path: 'bracket', component: BracketComponent},
  ] },
  {path: 'profile', component: ProfileComponent },
  {path: 'user/:id', component: UserComponent },
  {path: 'sign-up', component: SignUpComponent },
  {path: 'calendar', component: CalendarComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
