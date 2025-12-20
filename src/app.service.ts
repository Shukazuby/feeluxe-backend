import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealthCheck() {
    const dbStatus = await this.checkDatabase();
    
    return {
      status: dbStatus.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus.connected ? 'connected' : 'disconnected',
        name: dbStatus.name || 'unknown',
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  private async checkDatabase(): Promise<{ connected: boolean; name?: string }> {
    try {
      const state = this.connection.readyState;
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      return {
        connected: state === 1,
        name: this.connection.name,
      };
    } catch (error) {
      return {
        connected: false,
      };
    }
  }
}
