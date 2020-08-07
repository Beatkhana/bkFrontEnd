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


	constructor(public http: HttpClient) { }

	ngOnInit(): void {
		// console.log(this.tournament.quals_cutoff);
		this.getQuals()
			.subscribe(res => {
				// console.log(res);
				this.qualsScores = res;
				this.qualsScores.sort((a, b) => {
					let sumA = this.sumProperty(a.scores, 'score');
					let sumB = this.sumProperty(b.scores, 'score');
					let sumAPer = this.sumProperty(a.scores, 'percentage');
					let sumBPer = this.sumProperty(b.scores, 'percentage');
					a.avgPercentage = isNaN(sumAPer / a.scores.length * 100) ? 0 : (sumAPer / a.scores.length * 100).toFixed(2);
					b.avgPercentage = isNaN(sumBPer / b.scores.length * 100) ? 0 : (sumBPer / b.scores.length * 100).toFixed(2);
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
				// console.log(this.qualsScores);
			})
	}

	public getQuals(): Observable<any> {
		return this.http.get(`/api/tournament/${this.tournament.tournamentId}/qualifiers`);
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