import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

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
		this.getQuals()
			.subscribe(res => {
				this.qualsScores = res;
				for (const user of this.qualsScores) {
					for (const score of user.scores) {
						if(qualsPool.songs.find(x => x.hash == score.songHash).numNotes != 0) {
							score.percentage = score.score / (qualsPool.songs.find(x => x.hash == score.songHash).numNotes*920-7245)
						}else {
							score.percentage = 0;
						}
						score.score = Math.round(score.score / 2);
					}
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
					if (sumB == sumA) {
						if (a.globalRank == 0) return 1;
						if (b.globalRank == 0) return -1;
						return a.globalRank - b.globalRank;
					}
					return sumB - sumA;
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