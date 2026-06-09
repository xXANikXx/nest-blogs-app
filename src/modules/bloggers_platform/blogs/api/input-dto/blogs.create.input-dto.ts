import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class CreateBlogInputDto {
  @IsStringWithTrim(1, 15)
  @IsNotEmpty()
  name: string;

  @IsStringWithTrim(1, 500)
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
