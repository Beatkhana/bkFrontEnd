import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss']
})
export class LogsComponent extends AppComponent implements OnInit {

    loading = true;
    logs = [];

    columnsToDisplay = ['user','log','time'];
    
    ngOnInit(): void {
        this.getLogs()
        .subscribe(data => {
                this.loading = false;
                this.logs = data;
                console.log(data);
            });
    }

    getLogs(): Observable<any> {
        return this.http.get('/api/logs');
    }

}
