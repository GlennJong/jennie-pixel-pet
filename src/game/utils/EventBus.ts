import Phaser from 'phaser';

const emitter = new Phaser.Events.EventEmitter();

export const EventBus = {
  on(event: string, handler: (...args: any[]) => void, context?: any) {
    emitter.on(event, handler, context);
  },
  off(event: string, handler: (...args: any[]) => void, context?: any) {
    emitter.off(event, handler, context);
  },
  emit(event: string, ...args: any[]) {
    emitter.emit(event, ...args);
  },
  once(event: string, handler: (...args: any[]) => void, context?: any) {
    emitter.once(event, handler, context);
  }
};
