import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { ITournament } from '../models/tournament';
import { archiveTournamentDialog } from '../tournaments/tournaments.component';

@Component({
    selector: 'app-mini-tourneys',
    templateUrl: './mini-tourneys.component.html',
    styleUrls: ['./mini-tourneys.component.scss'],
})
export class MiniTourneysComponent extends AppComponent implements OnInit {
    title = 'BeatKhana!';
    private url = '/api/mini-tournaments';
    public tournaments: ITournament.Tournament[] = [];
    loading = true;

    ngOnInit(): void {
        this.getTournaments().subscribe((data) => {
            data.sort(function (a, b) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            this.tournaments = data;
            this.loading = false;
        });
        this.setTitle(this.title);
        this.metaTags.defineTags(
            '/',
            'BeatKhana!',
            'The one stop spot for all Beat Saber tournament information!',
            'assets/images/icon/BeatKhana Logo RGB.png'
        );
    }

    public getTournaments(): Observable<ITournament.Tournament[]> {
        return this.http.get<ITournament.Tournament[]>(this.url);
    }

    archive(id: string) {
        this.dialog.open(archiveTournamentDialog, {
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: { id: id },
        });
    }

    public archiveTournament(id: number): Observable<ITournament.Tournament[]> {
        return this.http.put<ITournament.Tournament[]>(
            '/api/archiveTournament',
            { id: id }
        );
    }

    public hasRole(roleId: number) {
        return !!this.user.roles.find((x) => x.roleId === roleId);
    }
}
