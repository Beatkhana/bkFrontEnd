import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs';
import { ITournament } from '../interfaces/tournament';

@Component({
    selector: 'app-tournaments',
    templateUrl: './tournaments.component.html',
    styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent extends AppComponent implements OnInit {

    title = "BeatKhana!";
    private url = '/api/tournaments';
    public tournaments = [];
    
    ngOnInit(): void {
        this.getTournaments()
            .subscribe(data => this.tournaments = data);
        this.setTitle(this.title);
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url);
    }

}
