import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-map-pool',
    templateUrl: './map-pool.component.html',
    styleUrls: ['./map-pool.component.scss']
})
export class MapPoolComponent extends AppComponent implements OnInit {

    private url = '/api/tournament';
    @Input() tournament;
    public tourneyId: string;
    loading = false;

    ngOnInit(): void {
        // this.route.parent.paramMap.subscribe(params => {
        //     this.tourneyId = params.get('id');
        //     this.getTournaments()
        //         .subscribe(data => {
        //             this.loading = false;
        //             this.tournament = data[0];
        //             this.tournament.safeInfo = this.sanitizer.bypassSecurityTrustHtml(this.tournament.info);
        //             this.setTitle(this.tournament.name + ' | ' + this.title);
        //         });
        // });
    }

    public getTournaments(): Observable<any[]> {
        return this.http.get<any[]>(this.url + '/' + this.tourneyId);
    }

    openEdit() {

    }

    delete() {

    }

}
