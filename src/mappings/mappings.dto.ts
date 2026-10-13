import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateMappingDto {
  @ApiProperty({ example: 'air handling unit' })
  @IsString() @MinLength(1)
  concept!: string;

  @ApiProperty({ example: 'https://brickschema.org/schema/Brick#Air_Handler_Unit' })
  @IsUrl({ require_tld: false })
  targetUri!: string;

  @ApiPropertyOptional({ enum: ['exactMatch', 'relatedMatch'], default: 'exactMatch' })
  @IsOptional() @IsIn(['exactMatch', 'relatedMatch'])
  relation?: 'exactMatch' | 'relatedMatch' = 'exactMatch';

  @ApiPropertyOptional({ description: 'Optional preferred URI for the hub concept.' })
  @IsOptional() @IsUrl({ require_tld: false })
  conceptUri?: string;
}
