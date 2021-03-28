import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { qualifierSession } from '../_models/qualifiers';

@Component({
    selector: 'app-sessions',
    templateUrl: './sessions.component.html',
    styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {

    @Input() tournament: any;
    loading = false;

    qualSessions: qualifierSession[];

    constructor(public http: HttpClient) { }

    async ngOnInit(): Promise<void> {
        this.loading = true;
        try {
            this.qualSessions = await this.http.get<qualifierSession[]>(`/api/tournament/${this.tournament.tournamentId}/qualifiers/sessions/all`).toPromise();
        } catch (error) { }
        this.loading = false;
    }

    displayTime(dateString: string) {
        return new Date(dateString).toLocaleString();
    }

}
