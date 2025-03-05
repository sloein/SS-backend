# 学习系统API接口设计

以下是按模块划分的系统API接口列表，遵循RESTful设计规范。

## 1. 认证模块 (Auth)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| POST | /api/auth/login | 系统登录 | 所有用户 |
| POST | /api/auth/register | 注册用户(仅学生) | 公开 |
| POST | /api/auth/wechat-login | 微信小程序登录 | 公开 |
| POST | /api/auth/refresh-token | 刷新访问令牌 | 已登录用户 |
| GET | /api/auth/profile | 获取当前用户信息 | 已登录用户 |
| PUT | /api/auth/profile | 更新当前用户信息 | 已登录用户 |
| PUT | /api/auth/change-password | 修改密码 | 已登录用户 |
| GET | /api/auth/permissions | 获取当前用户的权限列表 | 已登录用户 |

## 2. 用户管理模块 (User)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/users | 获取用户列表 | 管理员 |
| GET | /api/users/:id | 获取单个用户信息 | 管理员 |
| POST | /api/users | 创建新用户 | 管理员 |
| PUT | /api/users/:id | 更新用户信息 | 管理员 |
| DELETE | /api/users/:id | 删除用户 | 管理员 |
| PUT | /api/users/:id/status | 启用/禁用用户状态 | 管理员 |
| GET | /api/users/teachers | 获取教师列表 | 管理员 |
| GET | /api/users/students | 获取学生列表 | 管理员，教师 |
| GET | /api/users/:id/roles | 获取用户角色 | 管理员 |
| POST | /api/users/:id/roles | 为用户分配角色 | 管理员 |
| DELETE | /api/users/:id/roles/:roleId | 移除用户角色 | 管理员 |

## 3. 角色与权限模块 (Role/Permission)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/roles | 获取所有角色 | 管理员 |
| GET | /api/roles/:id | 获取角色详情 | 管理员 |
| POST | /api/roles | 创建新角色 | 管理员 |
| PUT | /api/roles/:id | 更新角色信息 | 管理员 |
| DELETE | /api/roles/:id | 删除角色 | 管理员 |
| GET | /api/roles/:id/permissions | 获取角色权限 | 管理员 |
| PUT | /api/roles/:id/permissions | 更新角色权限 | 管理员 |
| GET | /api/permissions | 获取所有权限 | 管理员 |
| GET | /api/permissions/:id | 获取权限详情 | 管理员 |
| POST | /api/permissions | 创建新权限 | 管理员 |
| PUT | /api/permissions/:id | 更新权限 | 管理员 |
| DELETE | /api/permissions/:id | 删除权限 | 管理员 |
| GET | /api/permissions/tree | 获取权限树 | 管理员 |

## 4. 课程模块 (Course)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/courses | 获取课程列表 | 所有用户 |
| GET | /api/courses/:id | 获取课程详情 | 所有用户 |
| POST | /api/courses | 创建新课程 | 教师，管理员 |
| PUT | /api/courses/:id | 更新课程信息 | 课程创建者，管理员 |
| DELETE | /api/courses/:id | 删除课程 | 课程创建者，管理员 |
| PUT | /api/courses/:id/status | 更改课程状态 | 课程创建者，管理员 |
| GET | /api/courses/:id/students | 获取选修该课程的学生 | 课程创建者，管理员 |
| POST | /api/courses/:id/enroll | 学生选修课程 | 学生 |
| DELETE | /api/courses/:id/enroll | 学生退选课程 | 学生 |
| GET | /api/courses/my | 获取我创建的课程 | 教师 |
| GET | /api/courses/enrolled | 获取我选修的课程 | 学生 |

## 5. 章节与内容模块 (Chapter/Content)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/courses/:courseId/chapters | 获取课程章节列表 | 所有用户 |
| GET | /api/chapters/:id | 获取章节详情 | 所有用户 |
| POST | /api/courses/:courseId/chapters | 创建新章节 | 课程创建者，管理员 |
| PUT | /api/chapters/:id | 更新章节信息 | 课程创建者，管理员 |
| DELETE | /api/chapters/:id | 删除章节 | 课程创建者，管理员 |
| PUT | /api/chapters/reorder | 调整章节顺序 | 课程创建者，管理员 |
| GET | /api/chapters/:chapterId/contents | 获取章节内容列表 | 所有用户 |
| GET | /api/contents/:id | 获取内容详情 | 所有用户 |
| POST | /api/chapters/:chapterId/contents | 添加章节内容 | 课程创建者，管理员 |
| PUT | /api/contents/:id | 更新内容信息 | 课程创建者，管理员 |
| DELETE | /api/contents/:id | 删除内容 | 课程创建者，管理员 |
| PUT | /api/contents/reorder | 调整内容顺序 | 课程创建者，管理员 |

## 6. 课程资料模块 (Material)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/courses/:courseId/materials | 获取课程资料列表 | 所有用户 |
| GET | /api/materials/:id | 获取资料详情 | 所有用户 |
| POST | /api/courses/:courseId/materials | 上传课程资料 | 课程创建者，管理员 |
| PUT | /api/materials/:id | 更新资料信息 | 课程创建者，管理员 |
| DELETE | /api/materials/:id | 删除资料 | 课程创建者，管理员 |
| GET | /api/materials/:id/download | 下载资料 | 选修课程的学生，课程创建者，管理员 |

## 7. 作业模块 (Assignment)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/courses/:courseId/assignments | 获取课程作业列表 | 所有选修课程用户 |
| GET | /api/assignments/:id | 获取作业详情 | 选修课程用户，课程创建者 |
| POST | /api/courses/:courseId/assignments | 创建新作业 | 课程创建者，管理员 |
| PUT | /api/assignments/:id | 更新作业信息 | 课程创建者，管理员 |
| DELETE | /api/assignments/:id | 删除作业 | 课程创建者，管理员 |
| GET | /api/assignments/:id/submissions | 获取作业提交列表 | 课程创建者，管理员 |
| GET | /api/assignments/:id/my-submission | 获取我的作业提交 | 学生 |
| POST | /api/assignments/:id/submit | 提交作业 | 学生 |
| PUT | /api/submissions/:id | 更新作业提交 | 提交作者（截止日期前） |
| PUT | /api/submissions/:id/grade | 批改作业 | 课程创建者，管理员 |

## 8. 学习进度模块 (Learning Progress)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/contents/:id/progress | 获取内容学习进度 | 学生本人 |
| PUT | /api/contents/:id/progress | 更新学习进度 | 学生 |
| GET | /api/courses/:id/progress | 获取课程总体进度 | 学生本人，课程创建者 |
| POST | /api/learning/actions | 记录学习行为 | 学生 |
| GET | /api/learning/last-position/:contentId | 获取上次学习位置 | 学生本人 |

## 9. 数据统计模块 (Statistics)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| GET | /api/statistics/user/:userId | 获取用户学习统计数据 | 用户本人，管理员 |
| GET | /api/statistics/user/daily | 获取用户每日学习数据 | 用户本人 |
| GET | /api/statistics/user/weekly | 获取用户每周学习数据 | 用户本人 |
| GET | /api/statistics/course/:courseId | 获取课程学习统计数据 | 课程创建者，管理员 |
| GET | /api/statistics/course/:courseId/student/:studentId | 获取学生在特定课程的学习数据 | 课程创建者，学生本人 |
| GET | /api/statistics/system | 获取系统总体统计数据 | 管理员 |
| GET | /api/statistics/system/active-users | 获取活跃用户统计 | 管理员 |

## 10. 文件上传模块 (File)

| 方法 | 接口路径 | 描述 | 权限 |
|------|----------|------|------|
| POST | /api/files/upload | 上传文件 | 已登录用户 |
| POST | /api/files/upload/avatar | 上传头像 | 已登录用户 |
| POST | /api/files/upload/course-cover | 上传课程封面 | 教师，管理员 |
| DELETE | /api/files/:id | 删除文件 | 文件上传者，管理员 | 