import { Component, HostListener, OnInit } from '@angular/core';
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

    page = 0;
    limit = 25;

    secondLoading = false;
    allRecords = false;

    async ngOnInit(): Promise<void> {
        this.getTournaments()
            .subscribe(data => {
                this.page++;
                data.sort(function (a, b) {
                    return <any>new Date(b.startDate) - <any>new Date(a.startDate);
                });
                this.tournaments = data;
                this.loading = false;
            });
        this.setTitle(this.title);
    }

    public getTournaments(): Observable<ITournament[]> {
        return this.http.get<ITournament[]>(this.url + `?page=${this.page}&limit=${this.limit}`);
    }

    @HostListener('window:scroll', ['$event'])
    doSomething(event) {
        if (window.pageYOffset - document.getElementsByClassName("gridArchive")[0].scrollHeight > -1000 && !this.secondLoading && !this.allRecords) {
            this.secondLoading = true
            this.getTournaments()
                .subscribe(data => {
                    if (data.length > 0) {
                        this.page += 1;
                        this.tournaments = this.tournaments.concat(data);
                        this.secondLoading = false;
                    }
                    //     this.secondLoading = false;
                    //     this.allRecords = true;
                    // }
                });
        }
    }

}
