import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { EditStaffComponent } from '../_modals/edit-staff/edit-staff.component';
import { staff } from '../_models/tournamentApi.model';

@Component({
    selector: 'app-tournament-staff',
    templateUrl: './tournament-staff.component.html',
    styleUrls: ['./tournament-staff.component.scss']
})
export class TournamentStaffComponent extends AppComponent implements OnInit {

    @Input() tournament;
    loading = true;
    staff: staff[] = [];

    async ngOnInit(): Promise<void> {
        this.staff = await this.http.get<staff[]>(`/api/tournament/${this.tournament.tournamentId}/staff`).toPromise();
        this.loading = false;
    }

    getRoleNames(roles: {id: number, role: string}[]) {
        return roles.map(x => x.role).join(', ');
    }

    openEdit() {
        const dialog = this.dialog.open(EditStaffComponent, {
            // height: '400px',
            minWidth: '40vw',
            maxHeight: '90vh',
            maxWidth: '95vw',
            data: {
                tournament: this.tournament,
                staff: this.staff
            }
        });

        dialog.afterClosed()
            .subscribe(async data => {
                if (data) { 
                    this.staff = await this.http.get<staff[]>(`/api/tournament/${this.tournament.tournamentId}/staff`).toPromise();
                }
            });
    }

}
