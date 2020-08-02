import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    curUser: User = null;

    linkOptions = {
        target: {
            url: "_blank"
        }
    }

    constructor(public http: HttpClient, public dialog: MatDialog,private notif: NotificationService,public cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        // console.log(this.tournament)
        this.participants.sort(this.orderGlobal)
        this.setParticpants();
        if (this.curUser == null) {
            this.updateUser();
        }
        this.participants.sort(this.orderGlobal)
        
    }

    orderGlobal(a,b) {
        if(a.globalRank == 0) return 1;
        if(b.globalRank == 0) return -1;
        return a.globalRank - b.globalRank;
    }

    updateUser() {
        this.logIn()
            .subscribe(data => {
                if (data) {
                    this.curUser = data[0];
                    if (this.curUser != null && (this.curUser['roleIds'].includes('1') || this.curUser.discordId == this.tournament.owner)) {
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

    editComment(participantId) {
        const dialog = this.dialog.open(editCommentDialog, {
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                participantId: participantId,
                tournament: this.tournament,
                curUser: this.participants.find(x=> x.participantId == participantId)
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    let userIndex = this.participants.findIndex(x=> x.participantId == data.participantId);
                    // console.log(this.participants[userIndex])
                    this.participants[userIndex] = {...this.participants[userIndex], ...data}
                    // console.log(this.participants[userIndex])
                    // console.log(data)
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
                this.participants.sort(this.orderGlobal);
                this.cd.detectChanges();
                // console.log(this.participants);
            })
    }

    getParticipants(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/participants`);
    }

}

@Component({
    selector: 'editCommentDialog',
    templateUrl: './editCommentDialog.html',
})
export class editCommentDialog implements OnInit {

    signUpForm: FormGroup;
    id: number;
    signUpComment: string = '';

    filteredOptions: Observable<any>;

    constructor(
        private fb: FormBuilder,
        public http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<editCommentDialog>,
        private notif: NotificationService
    ) {

    }

    ngOnInit() {
        // console.log(this.data)
        this.id = this.data.tournament.tournamentId;
        this.signUpComment = this.data.tournament.signup_comment;
        this.signUpForm = this.fb.group({
            comment: this.data.curUser.comment
        });
        if (!!this.data.tournament.comment_required) {
            this.signUpForm.controls['comment'].setValidators([Validators.required]);
            this.signUpForm.controls['comment'].updateValueAndValidity();
        }
    }

    get comment() {
        return this.signUpForm.get('comment');
    }

    onSubmit() {
        this.editSignup(this.signUpForm.value)
            .subscribe(data => {
                if (!data.flag) {
                    this.notif.showInfo('', 'Successfully updated sign up');
                    this.dialogRef.close({...this.signUpForm.value, participantId: this.data.participantId});
                } else {
                    console.error('Error', data.err)
                    this.notif.showError('', 'Error updaing sign up');
                    this.dialogRef.close(false);
                }
            }, error => {
                this.notif.showError('', 'Error updaing sign up');
                console.error("Error: ", error);
                this.dialogRef.close(false);
            });
    }

    editSignup(data: any): Observable<any> {
        return this.http.put(`/api/updateParticipant/${this.id}/${this.data.participantId}`, data);
    }
}
