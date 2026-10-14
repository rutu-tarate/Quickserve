
import { IsMongoId, IsInt, Min } from 'class-validator';

export class CreateCartDto {
  @IsMongoId()
  menuId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
