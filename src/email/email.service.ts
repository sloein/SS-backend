import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter} from 'nodemailer'

@Injectable()
export class EmailService {

    transporter: Transporter
    
    constructor(private configService: ConfigService) {
      this.transporter = createTransport({
          host: this.configService.get('nodemailer_host'),
          port: this.configService.get('nodemailer_port'),
          secure: false,
          auth: {
              user: this.configService.get('nodemailer_auth_user'),
              pass: this.configService.get('nodemailer_auth_pass')
          },
      });
    }
    

    async sendMail({ to, subject, html }) {
      await this.transporter.sendMail({
        from: {
          name: '在线学习系统',
          address: '2634460147@qq.com'
        },
        to,
        subject,
        html
      });
    }
}
