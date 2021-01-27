import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { addSongDialog } from '../map-pool/map-pool.component';

@Component({
	selector: 'app-qualifiers',
	templateUrl: './qualifiers.component.html',
	styleUrls: ['./qualifiers.component.scss']
})
export class QualifiersComponent implements OnInit {

	@Input() tournament;

	qualsScores = [];
	loading = true;

	pools: any = [];


	constructor(public http: HttpClient) { }

	async ngOnInit(): Promise<void> {
		let pools = await this.http.get(`api/tournament/${this.tournament.tournamentId}/map-pools`).toPromise();
		let qualsPool = Object.values(pools).find(x => x.is_qualifiers == 1);

		let leaderboards = {};


		this.getQuals()
			.subscribe(res => {
				this.qualsScores = res;
				for (const user of this.qualsScores) {
					if(user.avatar.includes('api') || user.avatar.includes('oculus')) {
                        user.avatar = "https://new.scoresaber.com" + user.avatar;
                    } else {
                        user.avatar = `/${user.avatar}` + (user.avatar.substring(0, 2) == 'a_' ? '.gif' : '.webp');
                        user.avatar = `https://cdn.discordapp.com/avatars/${user.discordId}${ user.avatar }`
                    }
					for (const score of user.scores) {
						if (qualsPool.songs.find(x => x.hash == score.songHash)?.numNotes != 0) {
							score.percentage = score.score / (qualsPool.songs.find(x => x.hash == score.songHash)?.numNotes * 920 - 7245)
						} else {
							score.percentage = 0;
						}
						score.score = Math.round(score.score / 2);
						if (score.songHash in leaderboards) {
							leaderboards[score.songHash].push({
								discordId: user.discordId,
								score: score.score
							});
						} else {
							leaderboards[score.songHash] = [{
								discordId: user.discordId,
								score: score.score
							}];
						}
					}
				}
				// leadboards.sort((a,b) => a.score)
				for (const leaderboard of Object.keys(leaderboards)) {
					leaderboards[leaderboard].sort((a, b) => b.score - a.score);
				}
				for (const user of this.qualsScores) {
					for (const score of user.scores) {
						score.position = leaderboards[score.songHash].findIndex(x => x.discordId == user.discordId);
					}
					user.scores.sort((a,b) => (a.songHash > b.songHash) ? 1 : ((a.songHash < b.songHash) ? -1 : 0));
				}

				this.qualsScores.sort((a, b) => {
					let sumA = this.sumProperty(a.scores, 'score');
					let sumB = this.sumProperty(b.scores, 'score');
					let sumAPer = this.sumProperty(a.scores, 'percentage');
					let sumBPer = this.sumProperty(b.scores, 'percentage');
					a.avgPercentage = isNaN(sumAPer / qualsPool.songs.length * 100) ? 0 : (sumAPer / qualsPool.songs.length * 100).toFixed(2);
					b.avgPercentage = isNaN(sumBPer / qualsPool.songs.length * 100) ? 0 : (sumBPer / qualsPool.songs.length * 100).toFixed(2);
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

	public getQuals(): Observable<any> {
		return this.http.get(`/api/tournament/${this.tournament.tournamentId}/qualifiers`);
	}

	async getPools() {
		return await this.http.get(`api/tournament/${this.tournament.tournamentId}/map-pools`).toPromise();
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