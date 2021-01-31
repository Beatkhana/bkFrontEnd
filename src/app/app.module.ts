import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TournamentsComponent, newTournamentDialog, archiveTournamentDialog } from './tournaments/tournaments.component';

import { HttpClientModule } from '@angular/common/http';
import { TournamentComponent, editTournament, tournamentSettingsDialog, signUpDialog, addPlayerDialog } from './tournament/tournament.component';
import { ArchiveComponent } from './archive/archive.component';
import { RankingsComponent } from './rankings/rankings.component';
import { editProfileDialog, ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';


import { ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatSliderModule} from '@angular/material/slider';

import { CKEditorModule } from 'ckeditor4-angular';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { CalendarComponent } from './calendar/calendar.component';

import { ToastrModule } from 'ngx-toastr';
import { BracketComponent, generateBracketDialog, updateMatchDialog } from './bracket/bracket.component';
import { addSongDialog, createPoolDialog, MapPoolComponent } from './map-pool/map-pool.component';
import { TeamComponent } from './team/team.component';
import { editUserDialog, UsersComponent } from './users/users.component';
import { editCommentDialog, ParticipantsComponent } from './participants/participants.component';

import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { LogsComponent } from './logs/logs.component';
import { QualifiersComponent } from './qualifiers/qualifiers.component';
import { MiniTourneysComponent } from './mini-tourneys/mini-tourneys.component';
import { RulesComponent } from './rules/rules.component';

import {
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { OverlayComponent } from './overlay/overlay.component';
import { TaComponent } from './ta/ta.component';
import { BadgesComponent } from './badges/badges.component';
import { CreateBadgeComponent } from './_modals/create-badge/create-badge.component';
import { Awards2020Component } from './awards2020/awards2020.component';
import { AssignBadgesComponent } from './_modals/assign-badges/assign-badges.component';
import { TournamentStaffComponent } from './tournament-staff/tournament-staff.component';
import { EditStaffComponent } from './_modals/edit-staff/edit-staff.component';
import { OverlayControllerComponent } from './overlay-controller/overlay-controller.component';


@NgModule({
    declarations: [
        AppComponent,
        TournamentsComponent,
        TournamentComponent,
        ArchiveComponent,
        newTournamentDialog,
        archiveTournamentDialog,
        editTournament,
        RankingsComponent,
        ProfileComponent,
        editProfileDialog,
        UserComponent,
        ConfirmDialogComponent,
        SignUpComponent,
        addPlayerDialog,
        editCommentDialog,
        CalendarComponent,
        BracketComponent,
        updateMatchDialog,
        generateBracketDialog,
        MapPoolComponent,
        createPoolDialog,
        addSongDialog,
        TeamComponent,
        UsersComponent,
        editUserDialog,
        tournamentSettingsDialog,
        signUpDialog,
        ParticipantsComponent,
        LogsComponent,
        QualifiersComponent,
        MiniTourneysComponent,
        RulesComponent,
        OverlayComponent,
        TaComponent,
        BadgesComponent,
        CreateBadgeComponent,
        Awards2020Component,
        AssignBadgesComponent,
        TournamentStaffComponent,
        EditStaffComponent,
        OverlayControllerComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatRadioModule,
        MatExpansionModule,
        MatSliderModule,
        CKEditorModule,
        ToastrModule.forRoot({
            maxOpened: 3,
            autoDismiss: true,
            newestOnTop: false,
            preventDuplicates: true,
            countDuplicates: true,
            resetTimeoutOnDuplicate: true
        }),
        NgxLinkifyjsModule.forRoot(),
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
