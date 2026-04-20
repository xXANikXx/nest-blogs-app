import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;

  @IsString()
  blogId: string;
}
