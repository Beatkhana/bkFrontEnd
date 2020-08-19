import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
    @Input() all: boolean = false;

    isAuthorised = false;
    curUser: User = null;

    linkOptions = {
        target: {
            url: "_blank"
        }
    }

    constructor(public http: HttpClient, public dialog: MatDialog, private notif: NotificationService, public cd: ChangeDetectorRef, public router: Router,) { }

    ngOnInit(): void {
        this.updateParticipants()
        if (this.curUser == null) {
            this.updateUser();
        }
    }

    updateParticipants() {
        this.getParticipants()
            .subscribe(data => {
                console.log(this.all)
                if (this.tournament.state == 'main_stage' && !this.all) {
                    if (this.tournament.type == 'battle_royale') {
                        data.sort(this.royaleSort);
                    } else {
                        data.sort(this.seedSort);
                    }
                } else {
                    data.sort(this.orderGlobal);
                }
                this.participants = data;
                for (const member of this.participants) {
                    if(member.avatar.includes('api') || member.avatar.includes('oculus')) {
                        member.avatar = "https://new.scoresaber.com" + member.avatar;
                    } else {
                        member.avatar = `/${member.avatar}` + (member.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        member.avatar = `https://cdn.discordapp.com/avatars/${member.discordId}${ member.avatar }`
                    }
                }
                this.cd.detectChanges();
                // console.log(this.participants);
            })
    }

    orderGlobal(a, b) {
        if (b.globalRank == 0) return -1;
        if (a.globalRank == 0) return 1;
        return a.globalRank - b.globalRank;
    }

    seedSort(a, b) {
        if (a.seed == b.seed) {
            if (b.globalRank == 0) return -1;
            if (a.globalRank == 0) return 1;
            return a.globalRank - b.globalRank;
        } else {
            if (b.seed == 0) return -1;
            if (a.seed == 0) return 1;
            return a.seed - b.seed;
        }
    }

    royaleSort(a, b) {
        if(a.position > b.position) return 1;
        if(a.position < b.position) return -1;

        if (a.position == 0 && b.position == 0) {
            if (b.seed == 0) return -1;
            if (a.seed == 0) return 1;
            return a.seed - b.seed;
        } else {
            return b.position - a.position;
        }
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
                                this.participants.splice(this.participants.findIndex(x => x.participantId == participantId), 1);
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

    eliminateParticipant(participantId) {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            // height: '400px',
            width: '400px',
            data: {
                cancelText: 'Cancel',
                confirmText: 'Confirm',
                message: 'Are you sure you want to eliminate this user?',
                title: 'Eliminate Participant?'
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    let info = {
                        participantId: participantId
                    }
                    this.elimParticipant(info)
                        .subscribe(data => {
                            if (!data.flag) {
                                this.notif.showSuccess('', 'Successfully eliminated participant');
                                // this.participants.splice(this.participants.findIndex(x => x.participantId == participantId), 1);
                                this.updateParticipants();
                            } else {
                                console.error("Error: ", data);
                                this.notif.showError('', 'Error eliminating participant');
                            }
                        }, error => {
                            this.notif.showError('', 'Error eliminating participant');
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
                curUser: this.participants.find(x => x.participantId == participantId)
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    let userIndex = this.participants.findIndex(x => x.participantId == data.participantId);
                    // console.log(this.participants[userIndex])
                    this.participants[userIndex] = { ...this.participants[userIndex], ...data }
                    // console.log(this.participants[userIndex])
                    // console.log(data)
                }
            });
    }

    removeParticipant(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.tournament.tournamentId}/deleteParticipant`, data)
    }

    elimParticipant(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.tournament.tournamentId}/elimParticipant`, data)
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
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/${ this.all ? 'allParticipants' : 'participants'}`);
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
                    this.dialogRef.close({ ...this.signUpForm.value, participantId: this.data.participantId });
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
