import { ApiProperty } from '@nestjs/swagger';

export class ChapterOrderVo {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    order: number;
}

export class UpdateChapterOrderVo {
    @ApiProperty()
    courseId: number;

    @ApiProperty({ type: [ChapterOrderVo] })
    chapters: ChapterOrderVo[];
} 