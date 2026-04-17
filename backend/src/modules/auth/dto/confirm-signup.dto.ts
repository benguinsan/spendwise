import { IsEmail, IsString, Length } from 'class-validator';

export class ConfirmSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 10)
  confirmationCode: string;
}
