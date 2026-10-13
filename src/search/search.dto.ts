import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
  @IsString() @MinLength(1)
  q!: string;

  @ApiPropertyOptional({ enum: ['all', 'exact', 'related'], default: 'all' })
  @IsOptional() @IsIn(['all', 'exact', 'related'])
  relation?: 'all' | 'exact' | 'related' = 'all';

  @ApiPropertyOptional({ description: 'Optional access level filter, e.g. public/private/all', default: 'all' })
  @IsOptional() @IsString()
  access?: string = 'all';
}
