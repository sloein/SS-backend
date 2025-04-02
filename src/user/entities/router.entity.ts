import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';  // 请确保路径正确

@Entity('routers')
export class Router {
  @PrimaryGeneratedColumn()
  menuId: number;

  @Column()
  menuName: string;

  @ManyToMany(() => User, user => user.routers)
  users: User[];

  @Column({ default: 0 })
  parentId: number;

  @Column({
    type: 'enum',
    enum: ['1', '2', '3'],
    comment: '1-目录 2-菜单页面 3-按钮权限'
  })
  menuType: string;

  @Column()
  path: string;

  @Column()
  name: string;

  @Column({ default: '' })
  component: string;

  @Column({ default: '' })
  icon: string;

  @Column({
    type: 'enum',
    enum: ['0', '1'],
    default: '1',
    comment: '是否显示'
  })
  isHide: string;

  @Column({ default: '' })
  isLink: string;

  @Column({
    type: 'enum',
    enum: ['0', '1'],
    default: '0',
    comment: '是否缓存'
  })
  isKeepAlive: string;

  @Column({
    type: 'enum',
    enum: ['0', '1'],
    default: '1',
    comment: '是否全屏'
  })
  isFull: string;

  @Column({
    type: 'enum',
    enum: ['0', '1'],
    default: '0',
    comment: '是否固定'
  })
  isAffix: string;

  @Column({ default: '' })
  redirect: string;
} 