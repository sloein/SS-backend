import { ApiProperty } from "@nestjs/swagger";
import { CourseStatus } from "../entities/course.entity";
import { User } from "src/user/entities/user.entity";
import { formatDate } from "src/utils";
import { Transform } from "class-transformer";

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
    
    // @ApiProperty({
    //     required: false,
    //     nullable: true
    // })
    // @Transform(({ value }) => formatDate(value))
    // startTime: Date | null;

    // @ApiProperty({
    //     required: false,
    //     nullable: true
    // })
    // @Transform(({ value }) => formatDate(value))
    // endTime: Date | null;

    @ApiProperty()
    @Transform(({ value }) => formatDate(value))
    createdAt: Date;

    @ApiProperty()
    @Transform(({ value }) => formatDate(value))
    updatedAt: Date;

    @ApiProperty({
        type: [User],
        description: '课程教师'
    })
    teachers: User[];

    @ApiProperty({
        type: [User],
        description: '课程学生'
    })
    students: User[];
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