import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class RegisterOntologyDto {
  @ApiProperty() @IsString() @MinLength(1)
  id!: string;

  @ApiProperty() @IsString() @MinLength(1)
  title!: string;

  @ApiProperty() @IsUrl({ require_tld: false })
  namespace!: string;

  @ApiProperty() @IsUrl({ require_tld: false })
  sourceUrl!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  publisher?: string;

  @ApiPropertyOptional({ default: 'ontology' }) @IsOptional() @IsString()
  resourceType?: string = 'ontology';

  @ApiPropertyOptional({ default: 'public' }) @IsOptional() @IsString()
  accessLevel?: string = 'public';

  @ApiPropertyOptional({ default: 'text/turtle' }) @IsOptional() @IsString()
  format?: string = 'text/turtle';

  @ApiPropertyOptional() @IsOptional() @IsString()
  domain?: string;
}
