-- 插入权限数据
INSERT INTO permissions (code, description) VALUES
('course_create', '创建课程'),
('course_edit', '编辑课程'),
('course_delete', '删除课程'),
('course_view', '查看课程'),
('assignment_create', '创建作业'),
('assignment_grade', '批改作业'),
('user_manage', '用户管理');

-- 插入角色数据
INSERT INTO roles (name) VALUES
('admin'),
('teacher'),
('student');

-- 角色-权限关联
INSERT INTO role_permissions (rolesId, permissionsId) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), -- admin 拥有所有权限
(2, 1), (2, 2), (2, 4), (2, 5), (2, 6),                  -- teacher 拥有课程和作业相关权限
(3, 4);                                                   -- student 只有查看权限

-- 插入用户数据
INSERT INTO users (username, password, nick_name, email, phoneNumber, isAdmin, real_name) VALUES
('admin', '123456', '管理员', 'admin@example.com', '13800000000', 1, '管理员'),
('teacher1', '123456', '张老师', 'teacher1@example.com', '13800000001', 0, '张三'),
('teacher2', '123456', '李老师', 'teacher2@example.com', '13800000002', 0, '李四'),
('student1', '123456', '小明', 'student1@example.com', '13800000003', 0, '王明'),
('student2', '123456', '小红', 'student2@example.com', '13800000004', 0, '李红');

-- 用户-角色关联
INSERT INTO user_roles (usersId, rolesId) VALUES
(1, 1), -- admin -> admin role
(2, 2), -- teacher1 -> teacher role
(3, 2), -- teacher2 -> teacher role
(4, 3), -- student1 -> student role
(5, 3); -- student2 -> student role

-- 插入路由数据
INSERT INTO routers (menuId, menuName, parentId, menuType, path, name, component, icon, isHide, isLink, isKeepAlive, isFull, isAffix, redirect) VALUES
-- 课程管理
(100, '课程管理', 0, '1', '/course', 'coursePage', '', 'Reading', '1', '', '0', '1', '1', '/course/list'),
(101, '课程列表', 100, '2', '/course/list', 'courseListPage', 'course/list/index', 'List', '1', '', '0', '1', '1', ''),
(102, '创建课程', 100, '2', '/course/create', 'courseCreatePage', 'course/create/index', 'Plus', '1', '', '0', '1', '1', ''),
(103, '课程详情', 100, '2', '/course/detail/:id', 'courseDetailPage', 'course/detail/index', 'InfoFilled', '1', '', '0', '1', '1', ''),
(110, '章节管理', 100, '2', '/course/chapter/:courseId', 'chapterPage', 'course/chapter/index', 'Files', '1', '', '0', '1', '1', ''),
(120, '作业管理', 100, '2', '/course/assignment/:courseId', 'assignmentPage', 'course/assignment/index', 'EditPen', '1', '', '0', '1', '1', ''),
(130, '学生管理', 100, '2', '/course/students/:courseId', 'studentsPage', 'course/students/index', 'User', '1', '', '0', '1', '1', '');

-- 插入课程数据
INSERT INTO courses (title, description, cover_image, status, start_time, end_time) VALUES
('Web开发基础', '学习HTML、CSS和JavaScript的基础知识', '/uploads/web-basic.jpg', 'in_progress', '2024-03-01', '2024-06-30'),
('Python编程入门', 'Python语言基础及应用', '/uploads/python-basic.jpg', 'not_started', '2024-04-01', '2024-07-31'),
('数据库设计', '关系型数据库理论与实践', '/uploads/database.jpg', 'not_started', '2024-04-15', '2024-08-15');

-- 课程-教师关联
INSERT INTO course_teachers (coursesId, usersId) VALUES
(1, 2), -- Web课程 - 张老师
(2, 3), -- Python课程 - 李老师
(3, 2); -- 数据库课程 - 张老师

-- 课程-学生关联
INSERT INTO course_students (coursesId, usersId) VALUES
(1, 4), -- Web课程 - 学生1
(1, 5), -- Web课程 - 学生2
(2, 4); -- Python课程 - 学生1

-- 插入章节数据
INSERT INTO chapters (title, description, `order`, course_id) VALUES
('HTML基础', 'HTML标签和基本结构', 1, 1),
('CSS样式', 'CSS选择器和样式属性', 2, 1),
('JavaScript基础', 'JS语法和基本概念', 3, 1),
('Python基础语法', 'Python的基本语法规则', 1, 2),
('Python函数', '函数的定义和使用', 2, 2),
('数据库概述', '数据库基本概念', 1, 3),
('SQL语句', 'SQL查询语句基础', 2, 3);

-- 插入章节内容
INSERT INTO contents (title, type, content_url, duration, `order`, chapterId) VALUES
('HTML文档结构', 'video', '/uploads/videos/html-basic.mp4', 30, 1, 1),
('HTML常用标签', 'document', '/uploads/docs/html-tags.pdf', NULL, 2, 1),
('CSS选择器', 'video', '/uploads/videos/css-selectors.mp4', 25, 1, 2),
('Python变量和数据类型', 'video', '/uploads/videos/python-vars.mp4', 40, 1, 4),
('Python练习题', 'quiz', '/uploads/quiz/python-quiz1.json', NULL, 2, 4);

-- 插入课程资料
INSERT INTO course_materials (title, type, url, file_size, courseId) VALUES
('Web开发教材', 'document', '/uploads/materials/web-textbook.pdf', 1024, 1),
('Python实践案例', 'document', '/uploads/materials/python-cases.pdf', 2048, 2),
('数据库设计指南', 'document', '/uploads/materials/database-guide.pdf', 1536, 3);

-- 插入作业
INSERT INTO assignments (title, description, deadline, courseId) VALUES
('HTML页面制作', '创建一个包含多个页面元素的HTML页面', '2024-03-15', 1),
('Python计算器', '使用Python实现一个简单的计算器程序', '2024-04-15', 2),
('数据库表设计', '设计一个商城数据库的表结构', '2024-05-01', 3);

-- 插入作业提交记录
INSERT INTO submissions (content, file_url, status, submit_time, assignmentId, studentId) VALUES
('已完成HTML页面制作', '/uploads/submissions/html-page.zip', 'pending', '2024-03-10', 1, 4),
('计算器程序已完成', '/uploads/submissions/calculator.py', 'graded', '2024-04-10', 2, 4),
('提交了数据库设计文档', '/uploads/submissions/db-design.pdf', 'pending', '2024-04-20', 3, 5); 