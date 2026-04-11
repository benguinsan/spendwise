export class CreateGoalDto {
  name: string;
  target: number;
  current?: number;
  deadline: string | Date;
  userId: string;
}
