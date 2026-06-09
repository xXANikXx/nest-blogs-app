import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CreatePostByBlogInputDto {
  @IsStringWithTrim(1, 30)
  title: string;

  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @IsStringWithTrim(1, 500)
  content: string;
}
