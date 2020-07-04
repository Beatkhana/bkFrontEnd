import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-rankings',
    templateUrl: './rankings.component.html',
    styleUrls: ['./rankings.component.scss']
})
export class RankingsComponent extends AppComponent implements OnInit {

    title = "Rankings | BeatKhana!";
    private url = '/api/rankings';
    public users = [];
    loading = true;

    ngOnInit(): void {
        this.getRanks()
            .subscribe(data => {
                this.users = data;
                this.loading = false;
                console.log(data)
            });
        this.setTitle(this.title);
    }

    public getRanks (): Observable<any> {
        return this.http.get(this.url);
    }

}
