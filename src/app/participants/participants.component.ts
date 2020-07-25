import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { User } from '../models/user.model';
import { NotificationService } from '../services/toast.service';

@Component({
    selector: 'app-participants',
    templateUrl: './participants.component.html',
    styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {

    @Input() tournament;
    @Input() participants: Array<any>;

    isAuthorised = false;
    user: User = null;

    linkOptions = {
        target: {
            url: "_blank"
        }
    }

    constructor(public http: HttpClient, public dialog: MatDialog,private notif: NotificationService) { }

    ngOnInit(): void {
        this.setParticpants();
        if (this.user == null) {
            this.updateUser();
        }
    }

    updateUser() {
        this.logIn()
            .subscribe(data => {
                if (data) {
                    this.user = data[0];
                    if (this.user != null && (this.user['roleIds'].includes('1') || this.user.discordId == this.tournament.owner)) {
                        this.isAuthorised = true;
                    }
                }
            });
    }

    deleteParticipant(participantId) {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            // height: '400px',
            width: '400px',
            data: {
                cancelText: 'Cancel',
                confirmText: 'Confirm',
                message: 'Are you sure you want to remove this user from this tournament?',
                title: 'Remove Participant?'
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    let info = {
                        participantId: participantId
                    }
                    this.removeParticipant(info)
                        .subscribe(data => {
                            if (!data.flag) {
                                this.notif.showSuccess('', 'Successfully removed participant');
                                this.participants.splice(this.participants.findIndex(x => x.participantId == participantId),1);
                            } else {
                                console.error("Error: ", data);
                                this.notif.showError('', 'Error removing participant');
                            }
                        }, error => {
                            this.notif.showError('', 'Error removing participant');
                            console.error("Error: ", error);
                        });
                }
            });
    }

    removeParticipant(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.tournament.tournamentId}/deleteParticipant`, data)
    }

    public logIn(): Observable<User[]> {
        // console.log('/api/discordAuth?code=' + code);
        return this.http.get<User[]>('/api/user');
    }

    setParticpants() {
        this.getParticipants()
            .subscribe(data => {
                this.participants = data;
            })
    }

    getParticipants(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/participants`);
    }

}
