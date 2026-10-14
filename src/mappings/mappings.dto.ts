import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, Matches, MinLength } from 'class-validator';

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

export class UploadAlignmentDto {
  @ApiProperty({ example: 'Brick-bot' })
  @IsString() @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/)
  id!: string;

  @ApiProperty() @IsUrl({ require_tld: false })
  sourceOntology!: string;

  @ApiProperty() @IsUrl({ require_tld: false })
  targetOntology!: string;
}
