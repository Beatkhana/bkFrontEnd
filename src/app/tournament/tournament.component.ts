import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ITournament } from '../interfaces/tournament';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-tournament',
    templateUrl: './tournament.component.html',
    styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent extends AppComponent implements OnInit {

    title = "BeatKhana!";
    private url = '/api/tournament';
    public tournaments = [];
    private tourneyId: string;
    loading = true;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.tourneyId = params.get('id');
            console.log(this.tourneyId);
            this.getTournaments()
                .subscribe(data => {
                    this.tournaments = data;
                    this.loading = false;
                    this.setTitle(this.tournaments[0].name + ' | ' + this.title);
                });
        });

        // console.log(this.user);
    }

    public getTournaments(): Observable<ITournament[]> {
        console.log(this.url + '/' + this.tourneyId)
        return this.http.get<ITournament[]>(this.url + '/' + this.tourneyId);
    }

}
