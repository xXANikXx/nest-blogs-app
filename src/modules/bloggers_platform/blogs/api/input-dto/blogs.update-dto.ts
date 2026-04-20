import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateBlogInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(15)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
