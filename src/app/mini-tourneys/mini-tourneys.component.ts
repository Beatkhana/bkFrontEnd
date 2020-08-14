import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { ITournament } from '../interfaces/tournament';
import { archiveTournamentDialog } from '../tournaments/tournaments.component';

@Component({
    selector: 'app-mini-tourneys',
    templateUrl: './mini-tourneys.component.html',
    styleUrls: ['./mini-tourneys.component.scss']
})
export class MiniTourneysComponent extends AppComponent implements OnInit {

    title = "BeatKhana!";
    private url = '/api/mini-tournaments';
    public tournaments = [];
    loading = true;



    ngOnInit(): void {
        this.getTournaments()
            .subscribe(data => {
                data.sort(function (a, b) {
                    return <any>new Date(a.startDate) - <any>new Date(b.startDate);
                });
                this.tournaments = data;
                this.loading = false;
            });
        this.setTitle(this.title);
        this.metaTags.defineTags('/', 'BeatKhana!', 'The one stop spot for all Beat Saber tournament information!', 'assets/images/icon/BeatKhana Logo RGB.png')
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url);
    }

    archive(id: number) {
        this.dialog.open(archiveTournamentDialog, {
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: { id: id }
        });
    }

    public archiveTournament(id: number): Observable<ITournament[]> {
        return this.http.put<ITournament[]>('/api/archiveTournament', { 'id': id });
    }
}
