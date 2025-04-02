# 学习系统后端服务 (SS-Backend)

## 项目概述

本项目是一个基于NestJS的学习系统后端服务，为管理员、教师和学生提供全面的功能支持。系统包括Web管理端和小程序端两大部分，实现了课程管理、学习跟踪、作业管理等核心功能。

## 技术栈

- **框架**: NestJS (Node.js框架)
- **数据库**: MySQL
- **ORM**: TypeORM
- **认证**: JWT (JSON Web Token)
- **API文档**: Swagger

## 系统功能

### Web管理端

#### 管理员功能
- 系统登录与权限管理
- 用户管理（教师账号管理）
- 角色权限分配
- 系统数据统计
- 课程审核管理

#### 教师功能
- 登录管理系统
- 课程管理（CRUD）
- 课程资料上传
- 作业发布与批改
- 学习数据统计查看

### 小程序端

#### 教师功能
- 微信登录
- 课程管理
- 作业批改
- 查看教学数据
- 个人信息管理

#### 学生功能
- 微信登录
- 课程学习
- 资料下载
- 作业提交
- 成绩查询
- 学习进度跟踪
- 个人数据统计

## 数据库设计

### 权限管理

采用RBAC（基于角色的访问控制）权限管理模型，通过角色和权限的分配来控制用户的系统访问权限。

### 核心表结构

1. **用户表(users)**
   ```
   - id: 主键
   - username: 用户名
   - password: 密码(加密存储)
   - nick_name: 昵称
   - email: 邮箱
   - phone: 手机号
   - real_name: 真实姓名
   - avatar: 头像URL
   - wechat_openid: 微信OpenID(小程序登录用)
   - status: 状态(启用/禁用)
   - is_admin	BOOLEAN	是否是管理员
   - created_time: 创建时间
   - updated_time: 更新时间
   ```

2. **角色表(roles)**
   ```
   - name: 角色名称
   ```

3. **权限表(permissions)**
   ```
   - code: 权限代码(如user:create)
   - description: 权限描述
   ```

4. **用户-角色关联表(user_roles)**
   ```
   - id: 主键
   - user_id: 用户ID(外键)
   - role_id: 角色ID(外键)
   ```

5. **角色-权限关联表(role_permissions)**
   ```
   - id: 主键
   - role_id: 角色ID(外键)
   - permission_id: 权限ID(外键)
   ```

6. **课程表(courses)**
   ```
   - id: 主键
   - title: 课程标题
   - description: 课程描述
   - cover_image: 封面图片
   - teacher_id: 教师ID(外键)
   - status: 状态(审核中/已发布/已下架)
   - created_at: 创建时间
   - updated_at: 更新时间
   ```

7. **课程章节表(course_chapters)**
   ```
   - id: 主键
   - course_id: 课程ID(外键)
   - title: 章节标题
   - description: 章节描述
   - order: 排序序号
   - duration: 预计学习时长(分钟)
   - created_at: 创建时间
   - updated_at: 更新时间
   ```

8. **章节内容表(chapter_contents)**
   ```
   - id: 主键
   - chapter_id: 章节ID(外键)
   - title: 内容标题
   - type: 内容类型(视频/文档/测验)
   - content_url: 内容资源URL
   - duration: 内容时长(视频类型时有效)
   - order: 排序序号
   - created_at: 创建时间
   - updated_at: 更新时间
   ```

9. **课程资料表(course_materials)**
   ```
   - id: 主键
   - course_id: 课程ID(外键)
   - title: 资料标题
   - type: 资料类型(文档/视频/链接)
   - url: 资料链接
   - file_size: 文件大小
   - created_at: 创建时间
   - updated_at: 更新时间
   ```

10. **学生-课程关联表(student_courses)**
    ```
    - id: 主键
    - student_id: 学生ID(外键)
    - course_id: 课程ID(外键)
    - progress: 学习进度(百分比)
    - last_learn_time: 最后学习时间
    - created_at: 创建时间(选课时间)
    - updated_at: 更新时间
    ```

11. **作业表(assignments)**
    ```
    - id: 主键
    - course_id: 课程ID(外键)
    - title: 作业标题
    - description: 作业描述
    - deadline: 截止日期
    - created_at: 创建时间
    - updated_at: 更新时间
    ```

12. **作业提交表(submissions)**
    ```
    - id: 主键
    - assignment_id: 作业ID(外键)
    - student_id: 学生ID(外键)
    - content: 提交内容
    - file_url: 提交文件URL
    - score: 得分
    - feedback: 教师反馈
    - status: 状态(未批改/已批改)
    - submit_time: 提交时间
    - created_at: 创建时间
    - updated_at: 更新时间
    ```

### 学习数据与进度跟踪表

13. **学习进度表(learning_progress)**
    ```
    - id: 主键
    - user_id: 用户ID(外键)
    - content_id: 内容ID(外键，关联chapter_contents表)
    - progress: 学习进度(百分比，0-100)
    - is_completed: 是否完成(布尔值)
    - last_position: 上次学习位置(适用于视频，秒)
    - learn_duration: 累计学习时长(分钟)
    - last_learn_time: 最后学习时间
    - created_at: 创建时间
    - updated_at: 更新时间
    ```

14. **课程学习统计表(course_learning_stats)**
    ```
    - id: 主键
    - user_id: 用户ID(外键)
    - course_id: 课程ID(外键)
    - completed_contents: 已完成内容数量
    - total_contents: 总内容数量
    - progress_percentage: 总体进度百分比
    - total_learn_time: 累计学习时长(分钟)
    - last_learn_date: 最后学习日期
    - is_finished: 是否完成课程
    - finish_date: 完成日期(如已完成)
    - created_at: 创建时间
    - updated_at: 更新时间
    ```

15. **学习行为记录表(learning_actions)**
    ```
    - id: 主键
    - user_id: 用户ID(外键)
    - course_id: 课程ID(外键)
    - content_id: 内容ID(外键，可选)
    - action_type: 行为类型(开始学习/暂停/继续/完成/下载资料)
    - action_time: 行为时间
    - duration: 持续时间(如适用)
    - device_info: 设备信息
    - ip_address: IP地址
    - created_at: 创建时间
    ```

16. **用户学习统计表(user_learning_statistics)**
    ```
    - id: 主键
    - user_id: 用户ID(外键)
    - total_courses: 选修课程总数
    - completed_courses: 已完成课程数
    - total_learn_time: 总学习时长(分钟)
    - daily_average_time: 日均学习时长(分钟)
    - weekly_average_time: 周均学习时长(分钟)
    - most_active_time: 最活跃时间段
    - last_active_date: 最后活跃日期
    - continuous_days: 连续学习天数
    - created_at: 创建时间
    - updated_at: 更新时间
    ```

17. **每日学习记录表(daily_learning_records)**
    ```
    - id: 主键
    - user_id: 用户ID(外键)
    - date: 日期
    - total_time: 当日学习总时长(分钟)
    - course_count: 学习课程数量
    - content_count: 学习内容数量
    - completed_content_count: 完成内容数量
    - created_at: 创建时间
    - updated_at: 更新时间
    ```

## 项目结构

```
src/
├── auth/               # 认证相关模块
├── config/             # 配置文件
├── controllers/        # 控制器
├── dto/                # 数据传输对象
├── entities/           # 数据库实体
├── guards/             # 守卫
├── interceptors/       # 拦截器
├── middleware/         # 中间件
├── modules/            # 功能模块
├── pipes/              # 管道
├── services/           # 服务
└── main.ts             # 应用入口
```

## 环境要求

- Node.js >= 14.x
- MySQL >= 8.0
- npm >= 7.x

## 安装与运行

### 1. 克隆项目

```bash
git clone <repository-url>
cd SS-backend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

在`src/config`中创建或修改数据库配置文件，设置正确的数据库连接参数。

### 4. 运行项目

开发环境:
```bash
npm run start:dev
```

生产环境:
```bash
npm run build
npm run start:prod
```

## API文档

项目运行后，可以通过以下URL访问Swagger API文档:

```
http://localhost:3000/api/docs
```

## 权限管理

系统采用RBAC(基于角色的访问控制)模型进行权限管理：

1. **预设角色**:
   - 管理员(admin): 拥有系统管理权限
   - 教师(teacher): 拥有课程和学生管理权限
   - 学生(student): 拥有学习相关功能权限

2. **权限粒度**:
   - 菜单权限: 控制页面访问
   - 按钮权限: 控制页面中按钮显示
   - API权限: 控制后端接口访问

3. **权限分配流程**:
   - 为角色分配对应权限(role_permissions)
   - 为用户分配对应角色(user_roles)
   - 用户通过角色间接获得权限

4. **权限验证**:
   - 使用守卫(Guard)进行接口权限控制
   - 基于JWT令牌中的用户信息查询用户角色和权限
   - 支持多角色和细粒度权限控制

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request 