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
import { TeamComponent } from './team/team.component';
import { UsersComponent } from './users/users.component';
import { AuthGuardGuard } from './guards/auth-guard.guard';
import { ParticipantsComponent } from './participants/participants.component';
import { LogsComponent } from './logs/logs.component';
import { QualifiersComponent } from './qualifiers/qualifiers.component';
import { MiniTourneysComponent } from './mini-tourneys/mini-tourneys.component';
import { RulesComponent } from './rules/rules.component';
import { OverlayComponent } from './overlay/overlay.component';
import { TaComponent } from './ta/ta.component';
import { BadgesComponent } from './badges/badges.component';
import { Awards2020Component } from './awards2020/awards2020.component';
import { TournamentStaffComponent } from './tournament-staff/tournament-staff.component';
import { OverlayControllerComponent } from './overlay-controller/overlay-controller.component';
import { SessionsComponent } from './sessions/sessions.component';
import { Awards2021Component } from './awards2021/awards2021.component';


const routes: Routes = [
    { path: '', component: TournamentsComponent },
    { path: 'mini-tournaments', component: MiniTourneysComponent },
    { path: 'archive', component: ArchiveComponent },
    { path: 'rules', component: RulesComponent },
    // {path: 'ranking', component: RankingsComponent },
    {
        path: 'tournament/:id', component: TournamentComponent, children: [
            { path: 'map-pool', component: MapPoolComponent },
            { path: 'bracket', component: BracketComponent },
            { path: 'participants', component: ParticipantsComponent },
            { path: 'allParticipants', component: ParticipantsComponent },
            { path: 'qualifiers', component: QualifiersComponent },
            { path: 'sessions', component: SessionsComponent },
            { path: 'staff', component: TournamentStaffComponent },
        ]
    },
    { path: 'profile', component: ProfileComponent },
    { path: 'user/:id', component: UserComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'calendar', component: CalendarComponent },
    { path: 'team', component: TeamComponent },
    { path: 'users', component: UsersComponent, canActivate: [AuthGuardGuard] },
    { path: 'logs', component: LogsComponent, canActivate: [AuthGuardGuard] },
    { path: 'overlay/:tourneyId/:stage/:matchId', component: OverlayComponent },
    { path: 'overlay/:tourneyId', component: OverlayControllerComponent },
    { path: 'ta', component: TaComponent },
    { path: 'badges', component: BadgesComponent },
    { path: 'awards/2020', component: Awards2020Component },
    { path: 'awards/2021', component: Awards2021Component },
    // { path: 'badges', component: BadgesComponent, canActivate: [AuthGuardGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
