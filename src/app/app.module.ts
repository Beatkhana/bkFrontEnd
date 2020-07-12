import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TournamentsComponent, newTournamentDialog, archiveTournamentDialog } from './tournaments/tournaments.component';

import { HttpClientModule } from '@angular/common/http';
import { TournamentComponent, editTournament } from './tournament/tournament.component';
import { ArchiveComponent } from './archive/archive.component';
import { RankingsComponent } from './rankings/rankings.component';
import { ProfileComponent } from './profile/profile.component';
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

import { CKEditorModule } from 'ckeditor4-angular';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { CalendarComponent } from './calendar/calendar.component';

import { ToastrModule } from 'ngx-toastr';
import { BracketComponent } from './bracket/bracket.component';
import { MapPoolComponent } from './map-pool/map-pool.component';


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
        UserComponent,
        ConfirmDialogComponent,
        SignUpComponent,
        CalendarComponent,
        BracketComponent,
        MapPoolComponent
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
        CKEditorModule,
        ToastrModule.forRoot({
            maxOpened: 3,
            autoDismiss: true,
            newestOnTop: false,
            preventDuplicates: true,
            countDuplicates: true,
            resetTimeoutOnDuplicate: true
        })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
