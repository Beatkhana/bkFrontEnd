export declare namespace ITournament {
    export interface TournamentSettings {
        id: number;
        tournamentId: string;
        public_signups: boolean;
        show_signups: boolean;
        public: boolean;
        state: string;
        type: string;
        has_bracket: boolean;
        has_map_pool: boolean;
        signup_comment: string;
        comment_required: boolean;
        bracket_sort_method: string;
        bracket_limit: number;
        quals_cutoff: number;
        show_quals: boolean;
        has_quals: boolean;
        countries: string;
        sort_method: string;
        standard_cutoff: number;
        ta_url: string;
        ta_password?: any;
        ta_event_flags?: any;
        qual_attempts: number;
        quals_method: string;
    }

    export interface Tournament {
        id: string;
        name: string;
        image: string;
        date: Date;
        endDate: Date;
        discord: string;
        twitchLink: string;
        prize: string;
        info: string;
        owner: string;
        archived: boolean;
        first: string;
        second: string;
        third: string;
        is_mini: boolean;
        tournament_settings: TournamentSettings;
    }
}
