export interface IAuditorRunTestFormFields {
  repoURL: string;
  commit: string;
  version?: string | null;
  name: string;
  subject?: string | null;
}