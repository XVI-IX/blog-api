export interface UserEntity {
  id: number;
  username: string;
  email: string;
  role: string;
  verified: boolean;
  verExp: Date;
  vertoken: string;
}
