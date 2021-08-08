import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { addSongDialog } from '../map-pool/map-pool.component';
import { NotificationService } from '../services/toast.service';
import { staff } from '../_models/tournamentApi.model';

@Component({
    selector: 'app-qualifiers',
    templateUrl: './qualifiers.component.html',
    styleUrls: ['./qualifiers.component.scss']
})
export class QualifiersComponent extends AppComponent implements OnInit {

    @Input() tournament;

    qualsScores = [];
    loading = true;

    pools: any = [];
    leaderboards = {};
    qualsPool;

    isAuth = false;
    staff: staff[];


    // constructor(public http: HttpClient, public dialog: MatDialog, private notif: NotificationService) { }

    async ngOnInit(): Promise<void> {
        let pools = await this.http.get(`api/tournament/${this.tournament.tournamentId}/map-pools`).toPromise();
        let tmp = Object.values(pools).filter(x => x.is_qualifiers == 1);
        this.qualsPool = Object.values(pools).find(x => x.is_qualifiers == 1);
        for (let pool of tmp) {
            if (pool.id != this.qualsPool.id) {
                this.qualsPool.songs = [...this.qualsPool.songs, ...pool.songs];
            }
        }
        this.staff = await this.http.get<staff[]>(`/api/tournament/${this.tournament.tournamentId}/staff`).toPromise();
        if (this.user) {
            this.isAuth = this.tournament.owner == this.user.discordId || this.user['roleIds'].includes('1') || !!this.staff.find(x => x.discordId == this.user.discordId && x.roles.map(x => x.id).includes(1));
        }

        this.getQuals()
            .subscribe(res => {
                this.qualsScores = res;
                for (const user of this.qualsScores) {
                    if (!user.avatar) user.avatar = "";
                    if (user.avatar.includes('api') || user.avatar.includes('oculus')) {
                        user.avatar = "https://new.scoresaber.com" + user.avatar;
                    } else {
                        user.avatar = `/${user.avatar}` + (user.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        user.avatar = `https://cdn.discordapp.com/avatars/${user.discordId}${user.avatar}`
                    }
                    for (const score of user.scores) {
                        if (this.qualsPool.songs.find(x => x.hash == score.songHash)?.numNotes != 0) {
                            score.percentage = score.score / (this.qualsPool.songs.find(x => x.hash == score.songHash)?.numNotes * 920 - 7245)
                        } else {
                            score.percentage = 0;
                        }
                        // score.score = Math.round(score.score / 2);
                        if (score.songHash in this.leaderboards) {
                            this.leaderboards[score.songHash].push({
                                discordId: user.discordId,
                                name: user.name,
                                avatar: user.avatar,
                                score: score.score,
                                percentage: (score.percentage * 100).toFixed(2)
                            });
                        } else {
                            this.leaderboards[score.songHash] = [{
                                discordId: user.discordId,
                                name: user.name,
                                avatar: user.avatar,
                                score: score.score,
                                percentage: (score.percentage * 100).toFixed(2)
                            }];
                        }
                    }

                }
                // leadboards.sort((a,b) => a.score)
                for (const leaderboard of Object.keys(this.leaderboards)) {
                    this.leaderboards[leaderboard].sort((a, b) => b.score - a.score);
                }
                for (const user of this.qualsScores) {
                    for (const score of user.scores) {
                        score.position = this.leaderboards[score.songHash].findIndex(x => x.discordId == user.discordId);
                    }
                    user.scores.sort((a, b) => (a.songHash > b.songHash) ? 1 : ((a.songHash < b.songHash) ? -1 : 0));
                }

                if (this.qualsScores.length == 1) {
                    let sumA = this.sumProperty(this.qualsScores[0].scores, 'score');
                    let sumAPer = this.sumProperty(this.qualsScores[0].scores, 'percentage');
                    this.qualsScores[0].avgPercentage = isNaN(sumAPer / this.qualsPool.songs.length * 100) ? 0 : (sumAPer / this.qualsPool.songs.length * 100).toFixed(2);
                    this.qualsScores[0].scoreSum = sumA;
                }

                this.qualsScores.sort((a, b) => {
                    let sumA = this.sumProperty(a.scores, 'score');
                    let sumB = this.sumProperty(b.scores, 'score');
                    let sumAPer = this.sumProperty(a.scores, 'percentage');
                    let sumBPer = this.sumProperty(b.scores, 'percentage');
                    a.avgPercentage = isNaN(sumAPer / this.qualsPool.songs.length * 100) ? 0 : (sumAPer / this.qualsPool.songs.length * 100).toFixed(2);
                    b.avgPercentage = isNaN(sumBPer / this.qualsPool.songs.length * 100) ? 0 : (sumBPer / this.qualsPool.songs.length * 100).toFixed(2);
                    a.scoreSum = sumA;
                    b.scoreSum = sumB;
                    if (b.avgPercentage == a.avgPercentage) {
                        if (sumB == sumA) {
                            if (a.globalRank == 0) return 1;
                            if (b.globalRank == 0) return -1;
                            return a.globalRank - b.globalRank;
                        } else {
                            return sumB - sumA;
                        }
                    } else {
                        return b.avgPercentage - a.avgPercentage;
                    }

                });

                this.qualsScores.splice(this.tournament.quals_cutoff, 0, {
                    cutoff: true
                });
                let i = 1;
                for (const user of this.qualsScores) {
                    if (!user.cutoff) {
                        user.position = i;
                        i++;
                    }
                }
                this.loading = false;
            })
    }

    taSync() {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            // height: '400px',
            width: '400px',
            data: {
                cancelText: 'Cancel',
                confirmText: 'Sync',
                message: 'Syncing scores with TA will remove all current scores and ensure that they match the TA leaderboards, this will bypass elements such as qualifier attempt limits or remove old scores that are no longer saved within TA.',
                title: 'Sync Scores With TA'
            }
        });

        dialog.afterClosed()
            .subscribe(async data => {
                if (data) {
                    try {
                        await this.http.put(`/api/tournament/${this.tournament.tournamentId}/qualifiers/sync`, {}).toPromise();
                        this.notif.showInfo('', 'Scores are being synced. Please refresh in a minute');
                    } catch (error) {
                        console.error("Error: ", error);
                        this.notif.showError('', 'Error syncing scores');
                    }
                }
            });
    }

    public getQuals(): Observable<any> {
        return this.http.get(`/api/tournament/${this.tournament.tournamentId}/qualifiers`);
    }

    async getPools() {
        return await this.http.get(`api/tournament/${this.tournament.tournamentId}/map-pools`).toPromise();
    }

    findSong(hash: string) {
        return this.qualsPool.songs.find(x => x.hash == hash);
    }

    sumProperty(items, prop) {
        if (items == null) {
            return 0;
        }
        return items.reduce(function (a, b) {
            return b[prop] == null ? a : a + b[prop];
        }, 0);
    }

}