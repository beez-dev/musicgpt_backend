export type UserSearchRow = {
  id: string;
  email: string;
  display_name: string;
};

export type AudioSearchRow = {
  id: string;
  prompt_id: string;
  user_id: string;
  title: string;
  created_at: Date;
};

export interface ISearchRepository {
  findUsersRankedByQuery(
    q: string,
    take: number,
    offset: number,
  ): Promise<UserSearchRow[]>;

  findAudioRankedByQuery(
    q: string,
    take: number,
    offset: number,
  ): Promise<AudioSearchRow[]>;
}
