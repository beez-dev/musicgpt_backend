import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Socket, Server } from 'socket.io';
import { AccessTokenPayload } from '../../../auth/domain/types/access-token-payload.type';

export type PromptCompletedPayload = {
  promptId: string;
  audioId: string;
  audioUrl: string;
};

@WebSocketGateway()
export class PromptEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PromptEventsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        // socket.io-client: io(url, { auth: { token } })
        ((client.handshake.auth as { token?: string })?.token ?? '') ||
        // header: Authorization: Bearer <token>
        (client.handshake.headers['authorization'] ?? '').replace(
          /^Bearer\s+/i,
          '',
        );

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        },
      );

      const userId = payload.id;
      await client.join(this.userRoom(userId));
      this.logger.debug(`Socket joined room ${this.userRoom(userId)}`);
    } catch (e) {
      this.logger.warn(`Socket connection rejected: ${(e as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  /**
   * Worker calls this to notify the user when prompt generation completes.
   */
  notifyPromptCompleted(userId: string, payload: PromptCompletedPayload) {
    this.server.to(this.userRoom(userId)).emit('prompt.completed', payload);
  }
}
