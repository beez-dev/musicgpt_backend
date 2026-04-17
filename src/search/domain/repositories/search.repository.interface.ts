export type UserSearchRow = {
  id: string;
  email: string;
  display_name: string;
  score: number;
};

export type AudioSearchRow = {
  id: string;
  prompt_id: string;
  user_id: string;
  title: string;
  created_at: Date;
  rank_score: number;
};

export interface ISearchRepository {
  findUsersRankedByQuery(
    q: string,
    limit: number,
    offset: number,
  ): Promise<UserSearchRow[]>;

  findAudioRankedByQuery(
    q: string,
    limit: number,
    offset: number,
  ): Promise<AudioSearchRow[]>;
}
