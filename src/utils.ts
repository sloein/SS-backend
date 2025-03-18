import { ParseIntPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export function md5(str) {
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex');
}

export function generateParseIntPipe(name) {
    return new ParseIntPipe({
      exceptionFactory() {
        throw new BadRequestException(name + ' 应该传数字');
      } 
    })
}

export function formatDate(date: Date) {
  if (!(date instanceof Date)) {
    return date;
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function formatDateToDate(date: string) {
  //把T和Z去掉
  return  new Date(date.replace('T', ' ').replace('Z', ''));
}
