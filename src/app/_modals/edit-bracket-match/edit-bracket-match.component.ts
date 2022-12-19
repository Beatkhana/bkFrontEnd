import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/toast.service';
import { editUserDialog } from 'src/app/users/users.component';

@Component({
    selector: 'app-edit-bracket-match',
    templateUrl: './edit-bracket-match.component.html',
    styleUrls: ['./edit-bracket-match.component.scss'],
})
export class EditBracketMatchComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private http: HttpClient,
        private dialogRef: MatDialogRef<editUserDialog>,
        private notif: NotificationService
    ) {}

    participants: any[];

    async ngOnInit(): Promise<void> {
        console.log(this.data);
        this.participants = await this.http
            .get<any[]>(
                `/api/tournament/${this.data.tournamentId}/allParticipants`
            )
            .toPromise();
        console.log(this.participants);
    }

    filteredOptions: any;
    filteredOptions2: any;

    updatePlayers(event, player: string) {
        console.log(event.option.value, player);
        this.data[player].id = event.option.value;
        // let usrIndex = this.participants.findIndex(x => x.discordId == event.option.value);
        // if (usrIndex > -1) {
        //     let tmp = <any>this.participants[usrIndex];
        //     tmp.roles = [];
        //     console.log(tmp);
        //     // this.data[player].id = tmp
        //     // this.data.staff.push(tmp);
        //     this.participants.splice(usrIndex, 1);
        //     this.filteredOptions = this.participants;
        // }
    }

    updateFilter(event: EventTarget) {
        if (event instanceof HTMLInputElement)
            this.filteredOptions = this._filter(event.value);
    }

    private _filter(name: string) {
        const filterValue = name.toLowerCase();
        return this.participants.filter(
            (option) => option.name.toLowerCase().indexOf(filterValue) === 0
        );
    }

    displayFn(id): string {
        let user = this.participants.find((x) => x.discordId == id);
        return user && user.name ? user.name : '';
    }

    async update() {
        console.log(this.data);
        let postData = {
            matchId: this.data.id,
            p1: this.data.p1.id,
            p2: this.data.p2.id,
        };
        try {
            await this.http
                .put(
                    `/api/tournament/${this.data.tournamentId}/bracket/update/${this.data.id}`,
                    postData
                )
                .toPromise();
            this.notif.showSuccess('', 'Successfully Updated Staff');
            this.dialogRef.close(true);
        } catch (error) {
            console.error(error);
            this.notif.showError('', 'Error Updating Staff');
            this.dialogRef.close(false);
        }
    }
}
