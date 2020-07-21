import { Component, OnInit } from '@angular/core';
import { ITournament } from '../interfaces/tournament';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-archive',
    templateUrl: './archive.component.html',
    styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent extends AppComponent implements OnInit {

    title = "Archive | BeatKhana!";
    private url = '/api/tournament/archived';
    public tournaments = [];
    public loading = true;
    private tourneyId: string;

    async ngOnInit(): Promise<void> {
        this.getTournaments()
            .subscribe(data => {
                this.tournaments = data;
                this.loading = false;
            });
        this.setTitle(this.title);
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url);
    }

}
