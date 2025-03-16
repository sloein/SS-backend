create table courses
(
    id          int auto_increment
        primary key,
    title       varchar(255)                                    not null,
    description text                                            not null,
    cover_image varchar(255)                                    not null,
    status      enum ('not_started', 'in_progress', 'finished') not null,
    start_time  timestamp                                       null,
    end_time    timestamp                                       null,
    created_at  datetime(6) default CURRENT_TIMESTAMP(6)        not null,
    updated_at  datetime(6) default CURRENT_TIMESTAMP(6)        not null on update CURRENT_TIMESTAMP(6)
);

create table assignments
(
    id          int auto_increment
        primary key,
    title       varchar(255)                             not null,
    description text                                     not null,
    deadline    timestamp   default CURRENT_TIMESTAMP    not null on update CURRENT_TIMESTAMP,
    created_at  datetime(6) default CURRENT_TIMESTAMP(6) not null,
    updated_at  datetime(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6),
    courseId    int                                      null,
    constraint FK_9e5684667ea189ade0fc79fa4f1
        foreign key (courseId) references courses (id)
);

create table chapters
(
    id          int auto_increment
        primary key,
    title       varchar(255)                             not null,
    description text                                     null,
    `order`     int                                      not null,
    course_id   int                                      not null,
    created_at  datetime(6) default CURRENT_TIMESTAMP(6) not null,
    updated_at  datetime(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6),
    courseId    int                                      null,
    constraint FK_becd2c25ed5b601e7a4466271c8
        foreign key (courseId) references courses (id)
);

create table contents
(
    id          int auto_increment
        primary key,
    title       varchar(255)                             not null,
    type        enum ('video', 'document', 'quiz')       not null,
    content_url varchar(255)                             not null,
    duration    int                                      null,
    `order`     int                                      not null,
    created_at  datetime(6) default CURRENT_TIMESTAMP(6) not null,
    updated_at  datetime(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6),
    chapterId   int                                      null,
    constraint FK_201c50be60109c087379b66a03e
        foreign key (chapterId) references chapters (id)
);

create table course_materials
(
    id         int auto_increment
        primary key,
    title      varchar(255)                             not null,
    type       enum ('document', 'video', 'link')       not null,
    url        varchar(255)                             not null,
    file_size  int                                      null,
    created_at datetime(6) default CURRENT_TIMESTAMP(6) not null,
    updated_at datetime(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6),
    courseId   int                                      null,
    constraint FK_ace3ef4157ae10a215848945a36
        foreign key (courseId) references courses (id)
);

create table permissions
(
    id          int auto_increment
        primary key,
    code        varchar(20)  not null comment '权限代码',
    description varchar(100) not null comment '权限描述'
);

create table roles
(
    id   int auto_increment
        primary key,
    name varchar(20) not null comment '角色名'
);

create table role_permissions
(
    rolesId       int not null,
    permissionsId int not null,
    primary key (rolesId, permissionsId),
    constraint FK_0cb93c5877d37e954e2aa59e52c
        foreign key (rolesId) references roles (id)
            on update cascade on delete cascade,
    constraint FK_d422dabc78ff74a8dab6583da02
        foreign key (permissionsId) references permissions (id)
            on update cascade on delete cascade
);

create index IDX_0cb93c5877d37e954e2aa59e52
    on role_permissions (rolesId);

create index IDX_d422dabc78ff74a8dab6583da0
    on role_permissions (permissionsId);

create table users
(
    id            int auto_increment
        primary key,
    username      varchar(50)                              not null comment '用户名',
    password      varchar(50)                              not null comment '密码',
    nick_name     varchar(50)                              not null comment '昵称',
    email         varchar(50)                              not null comment '邮箱',
    avatar       varchar(100)                             null comment '头像',
    phoneNumber   varchar(20)                              null comment '手机号',
    isFrozen      tinyint     default 0                    not null comment '是否冻结',
    real_name     varchar(50)                              null comment '真实姓名',
    wechat_openid varchar(100)                             null comment '微信OpenID',
    isAdmin       tinyint     default 0                    not null comment '是否是管理员',
    createTime    datetime(6) default CURRENT_TIMESTAMP(6) not null,
    updateTime    datetime(6) default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6)
);

create table course_students
(
    coursesId int not null,
    usersId   int not null,
    primary key (coursesId, usersId),
    constraint FK_bb07f482dc7f50d327712fcb054
        foreign key (usersId) references users (id)
            on update cascade on delete cascade,
    constraint FK_fcce61318e345bac0a1c11ebdb9
        foreign key (coursesId) references courses (id)
            on update cascade on delete cascade
);

create index IDX_bb07f482dc7f50d327712fcb05
    on course_students (usersId);

create index IDX_fcce61318e345bac0a1c11ebdb
    on course_students (coursesId);

create table course_teachers
(
    coursesId int not null,
    usersId   int not null,
    primary key (coursesId, usersId),
    constraint FK_66377dc7bf23d54638cfc3c0b7b
        foreign key (coursesId) references courses (id)
            on update cascade on delete cascade,
    constraint FK_af6a8ca56529032218b1b10169e
        foreign key (usersId) references users (id)
            on update cascade on delete cascade
);

create index IDX_66377dc7bf23d54638cfc3c0b7
    on course_teachers (coursesId);

create index IDX_af6a8ca56529032218b1b10169
    on course_teachers (usersId);

create table submissions
(
    id           int auto_increment
        primary key,
    content      text                                                    not null,
    file_url     varchar(255)                                            null,
    score        decimal(5, 2)                                           null,
    feedback     text                                                    null,
    status       enum ('pending', 'graded') default 'pending'            not null,
    submit_time  timestamp                  default CURRENT_TIMESTAMP    not null on update CURRENT_TIMESTAMP,
    created_at   datetime(6)                default CURRENT_TIMESTAMP(6) not null,
    updated_at   datetime(6)                default CURRENT_TIMESTAMP(6) not null on update CURRENT_TIMESTAMP(6),
    assignmentId int                                                     null,
    studentId    int                                                     null,
    constraint FK_4fc99318a291abd7e2a50f50851
        foreign key (studentId) references users (id),
    constraint FK_c2611c601f49945ceff5c0909a2
        foreign key (assignmentId) references assignments (id)
);

create table user_roles
(
    usersId int not null,
    rolesId int not null,
    primary key (usersId, rolesId),
    constraint FK_13380e7efec83468d73fc37938e
        foreign key (rolesId) references roles (id)
            on update cascade on delete cascade,
    constraint FK_99b019339f52c63ae6153587380
        foreign key (usersId) references users (id)
            on update cascade on delete cascade
);

create index IDX_13380e7efec83468d73fc37938
    on user_roles (rolesId);

create index IDX_99b019339f52c63ae615358738
    on user_roles (usersId);

