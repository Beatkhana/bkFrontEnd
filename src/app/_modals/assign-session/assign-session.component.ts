import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/toast.service';
import { qualifierSession } from 'src/app/_models/qualifiers';

@Component({
    selector: 'app-assign-session',
    templateUrl: './assign-session.component.html',
    styleUrls: ['./assign-session.component.scss']
})
export class AssignSessionComponent implements OnInit {

    constructor(
        public http: HttpClient,
        private dialogRef: MatDialogRef<AssignSessionComponent>,
        private notif: NotificationService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {

    }

    qualSessions: qualifierSession[];
    selectedSession: qualifierSession;

    loading = false;

    async ngOnInit(): Promise<void> {
        this.loading = true;
        this.selectedSession = this.data.session;
        this.qualSessions = await this.http.get<qualifierSession[]>(`/api/tournament/${this.data.tournament.tournamentId}/qualifiers/sessions`).toPromise();
        console.log(this.selectedSession);
        this.loading = false;
    }

    async update() {
        this.loading = true;
        try {
            await this.http.post(`/api/tournament/${this.data.tournament.tournamentId}/qualifiers/sessions/assign`, { sessionId: this.selectedSession.id }).toPromise();
            this.notif.showInfo('', 'Successfully Updated Session');
            this.dialogRef.close(true);
        } catch (error) {
            console.error('Error', error)
            this.notif.showError('', 'Error Updating Session');
            this.dialogRef.close(false);
        }
    }

    selectSession(session: qualifierSession) {
        this.selectedSession = session;
    }

    displayTime(dateString: string) {
        return new Date(dateString).toLocaleString();
    }

}
