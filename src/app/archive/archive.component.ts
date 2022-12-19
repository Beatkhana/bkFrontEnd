import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { ITournament } from '../models/tournament';

@Component({
    selector: 'app-archive',
    templateUrl: './archive.component.html',
    styleUrls: ['./archive.component.scss'],
})
export class ArchiveComponent extends AppComponent implements OnInit {
    title = 'Archive | BeatKhana!';
    private url = '/api/tournament/archived';
    public tournaments: ITournament.Tournament[] = [];
    public loading = true;

    page = 0;
    limit = 25;

    secondLoading = false;
    allRecords = false;

    async ngOnInit(): Promise<void> {
        this.getTournaments().subscribe((data) => {
            this.page++;
            data.sort(function (a, b) {
                return (
                    new Date(b.date).getTime() - new Date(a.endDate).getTime()
                );
            });
            this.tournaments = data;
            this.loading = false;
        });
        this.setTitle(this.title);
    }

    public getTournaments(): Observable<ITournament.Tournament[]> {
        return this.http.get<ITournament.Tournament[]>(
            this.url + `?page=${this.page}&limit=${this.limit}`
        );
    }

    @HostListener('window:scroll', ['$event'])
    doSomething() {
        if (
            window.pageYOffset -
                document.getElementsByClassName('gridArchive')[0].scrollHeight >
                -1000 &&
            !this.secondLoading &&
            !this.allRecords
        ) {
            this.secondLoading = true;
            this.getTournaments().subscribe((data) => {
                if (data.length > 0) {
                    this.page += 1;
                    this.tournaments = this.tournaments.concat(data);
                    this.secondLoading = false;
                }
            });
        }
    }
}
