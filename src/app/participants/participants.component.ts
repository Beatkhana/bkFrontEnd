import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { User } from '../models/user.model';
import { NotificationService } from '../services/toast.service';
import { UserAuthService } from '../services/user-auth.service';
import { AddPlayerComponent } from '../_modals/add-player/add-player.component';
import { AssignSessionComponent } from '../_modals/assign-session/assign-session.component';
import { participant } from '../_models/participants';
import { qualifierSession } from '../_models/qualifiers';

@Component({
    selector: 'app-participants',
    templateUrl: './participants.component.html',
    styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {

    @Input() tournament;
    @Input() participants: participant[];
    @Input() all: boolean = false;

    isAuthorised = false;
    curUser: User = null;
    loading = true;

    editMode = false;

    nonQualified: participant[];

    linkOptions = {
        target: {
            url: "_blank"
        }
    }

    userSession: qualifierSession;

    constructor(public http: HttpClient, public dialog: MatDialog, private notif: NotificationService, public cd: ChangeDetectorRef, public router: Router, private userS: UserAuthService) { }

    ngOnInit(): void {
        this.updateParticipants()
        if (this.curUser == null) {
            this.updateUser();
        }
    }

    async updateParticipants() {
        this.loading = true;
        let info = await this.http.get<participant[]>(`/api/tournament/${this.tournament.tournamentId}/${this.all ? 'allParticipants' : 'participants'}`).toPromise();
        for (let i = 0; i < info.length; i++) {
            if (info[i].avatar.includes('api') || info[i].avatar.includes('oculus')) {
                info[i].avatar = "https://new.scoresaber.com" + info[i].avatar;
            } else {
                // info[i].avatar = `/${info[i].avatar}` + (info[i].avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                info[i].avatar = `https://cdn.discordapp.com/avatars/${info[i].discordId}/${info[i].avatar}` + (info[i].avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp')
            }
        }
        this.nonQualified = info.filter(x => x.seed == 0);
        this.participants = info;
        this.sortParticipants();
        try {
            this.userSession = await this.http.get<qualifierSession>(`/api/tournament/${this.tournament.tournamentId}/qualifiers/sessions/current`).toPromise();
        } catch (error) {

        }
        this.loading = false;
    }

    displayTime(dateString: string) {
        return new Date(dateString).toLocaleString();
    }

    sortParticipants() {
        if ((this.tournament.state == 'main_stage' || this.tournament.state == 'archived') && !this.all) {
            this.participants = this.participants.filter(x => x.seed != 0);
            if (this.tournament.type == 'battle_royale') {
                this.participants.sort(this.royaleSort);
            } else {
                this.participants.sort(this.seedSort);
            }
        } else {
            if (this.tournament.sort_method == 'globalRank') {
                this.participants.sort(this.orderGlobal);
            } else if (this.tournament.sort_method == 'date') {
                this.participants.sort(this.dateSort);
            }
        }
    }

    orderGlobal(a, b) {
        if (b.globalRank == 0) return -1;
        if (a.globalRank == 0) return 1;
        return a.globalRank - b.globalRank;
    }

    dateSort(a, b) {
        return a.participantId - b.participantId;
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
        if (a.position == 0 && b.position == 0) {
            if (b.seed == 0) return -1;
            if (a.seed == 0) return 1;
            return a.seed - b.seed;
        } else {
            return a.position - b.position;
        }
    }

    async updateUser() {
        this.curUser = await this.userS.curUser();
        if (this.curUser != null && (this.curUser['roleIds'].includes('1') || this.curUser.discordId == this.tournament.owner)) {
            this.isAuthorised = true;
        }
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
            .subscribe(async data => {
                if (data) {
                    let info = {
                        participantId: participantId
                    }
                    try {
                        await this.http.post(`/api/tournament/${this.tournament.tournamentId}/deleteParticipant`, info).toPromise();
                        this.notif.showSuccess('', 'Successfully removed participant');
                        this.participants.splice(this.participants.findIndex(x => x.participantId == participantId), 1);
                    } catch (error) {
                        console.error("Error: ", error);
                        this.notif.showError('', 'Error removing participant');
                    }
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
            .subscribe(async data => {
                if (data) {
                    let info = {
                        participantId: participantId
                    }
                    try {
                        await this.http.post(`/api/tournament/${this.tournament.tournamentId}/elimParticipant`, info).toPromise();
                        this.notif.showSuccess('', 'Successfully eliminated participant');
                        this.updateParticipants();
                    } catch (error) {
                        console.error("Error: ", error);
                        this.notif.showError('', 'Error eliminating participant');
                    }
                    // this.elimParticipant(info)
                    //     .subscribe(data => {
                    //         if (!data.flag) {
                    //             this.notif.showSuccess('', 'Successfully eliminated participant');
                    //             // this.participants.splice(this.participants.findIndex(x => x.participantId == participantId), 1);
                    //             this.updateParticipants();
                    //         } else {
                    //             console.error("Error: ", data);
                    //             this.notif.showError('', 'Error eliminating participant');
                    //         }
                    //     }, error => {
                    //         this.notif.showError('', 'Error eliminating participant');
                    //         console.error("Error: ", error);
                    //     });
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

    updateQualSession() {
        const dialog = this.dialog.open(AssignSessionComponent, {
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                tournament: this.tournament,
                session: this.userSession
            }
        });

        dialog.afterClosed()
            .subscribe(data => {
                if (data) {
                    // let userIndex = this.participants.findIndex(x => x.participantId == data.participantId);
                    // // console.log(this.participants[userIndex])
                    // this.participants[userIndex] = { ...this.participants[userIndex], ...data }
                    // console.log(this.participants[userIndex])
                    // console.log(data)
                }
            });
    }

    removeParticipant(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.tournament.tournamentId}/deleteParticipant`, data);
    }

    elimParticipant(data: any): Observable<any> {
        return this.http.post(`/api/tournament/${this.tournament.tournamentId}/elimParticipant`, data);
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

    canEdit() {
        return this.participants.every(x => x.position == 0);
    }

    getParticipants(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/${this.all ? 'allParticipants' : 'participants'}`);
    }

    addPlayer() {
        const dialog = this.dialog.open(AddPlayerComponent, {
            minWidth: '60vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
        });
    }

    recalc() {

    }

    async save() {
        try {
            await this.http.put(`/api/tournament/${this.tournament.tournamentId}/participants`, this.participants).toPromise();
            this.notif.showSuccess('', 'Successfully updated participant');
            this.updateParticipants();
        } catch (error) {
            console.error("Error: ", error);
            this.notif.showError('', 'Error updating participants');
        }
    }

    seedDragDrop(event: CdkDragDrop<participant>) {
        // console.log(event);
        if (event.previousContainer === event.container) {
            // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            if (this.participants[event.currentIndex].position == 0) {
                moveItemInArray(this.participants, event.previousIndex, event.currentIndex);
                for (let i = 0; i < this.participants.length; i++) {
                    const user = this.participants[i];
                    user.seed = i + 1;
                }
            }
        } else {
            if (this.participants.find(x => x == event.item.data)) {
                transferArrayItem(this.participants,
                    this.nonQualified,
                    event.previousIndex,
                    event.currentIndex);
            } else {
                transferArrayItem(this.nonQualified,
                    this.participants,
                    event.previousIndex,
                    event.currentIndex);
            }
            for (let i = 0; i < this.participants.length; i++) {
                const user = this.participants[i];
                user.seed = i + 1;
            }
        }

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

    async onSubmit() {
        // this.editSignup(this.signUpForm.value)
        //     .subscribe(data => {
        //         if (!data.flag) {
        //             this.notif.showInfo('', 'Successfully updated sign up');
        //             this.dialogRef.close({ ...this.signUpForm.value, participantId: this.data.participantId });
        //         } else {
        //             console.error('Error', data.err)
        //             this.notif.showError('', 'Error updaing sign up');
        //             this.dialogRef.close(false);
        //         }
        //     }, error => {
        //         this.notif.showError('', 'Error updaing sign up');
        //         console.error("Error: ", error);
        //         this.dialogRef.close(false);
        //     });
        try {
            await this.http.put(`/api/updateParticipant/${this.id}/${this.data.participantId}`, this.signUpForm.value).toPromise();
            this.notif.showInfo('', 'Successfully updated sign up');
            this.dialogRef.close({ ...this.signUpForm.value, participantId: this.data.participantId });
        } catch (error) {
            this.notif.showError('', 'Error updaing sign up');
            console.error("Error: ", error);
            this.dialogRef.close(false);
        }
    }

    editSignup(data: any): Observable<any> {
        return this.http.put(`/api/updateParticipant/${this.id}/${this.data.participantId}`, data);
    }
}
