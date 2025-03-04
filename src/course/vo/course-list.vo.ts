import { ApiProperty } from "@nestjs/swagger";
import { CourseStatus } from "../entities/course.entity";

class Course {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;
    
    @ApiProperty()
    coverImage: string;


    @ApiProperty({
        enum: CourseStatus,
        enumName: 'CourseStatus'
    })
    status: CourseStatus;
    
    @ApiProperty({
        required: false,
        nullable: true
    })
    startTime: Date | null;

    @ApiProperty({
        required: false,
        nullable: true
    })
    endTime: Date | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CourseListVo {
    @ApiProperty({
        type: [Course],
        description: '课程列表'
    })
    courses: Course[];

    @ApiProperty({
        description: '总记录数'
    })
    totalCount: number;
} 