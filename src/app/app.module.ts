import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TournamentsComponent } from './tournaments/tournaments.component';

import { HttpClientModule } from '@angular/common/http';
import { TournamentComponent } from './tournament/tournament.component';

@NgModule({
    declarations: [
        AppComponent,
        TournamentsComponent,
        TournamentComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
