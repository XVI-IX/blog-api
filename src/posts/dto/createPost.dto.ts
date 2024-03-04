import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  category_id: number;
}
