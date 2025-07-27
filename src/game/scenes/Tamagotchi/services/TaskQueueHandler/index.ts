import Phaser from "phaser";

import { store, setStoreState } from "@/game/store";
import { filterFromMatchList } from "@/game/utils/filterFromMatchList";

import { Message, TaskMappingItem, Task } from "./types";


const MESSAGE_QUEUE_STORE_KEY = 'global.messageQueue';
const TASK_QUEUE_STORE_KEY = 'tamagotchi.taskQueue';
const CONFIG_MAPPING_LIST_KEY = 'mapping';

export class TaskQueueHandler {
  private taskQueueState = store<Task[]>(TASK_QUEUE_STORE_KEY);
  private messageQueueState = store<Message[]>(MESSAGE_QUEUE_STORE_KEY);
  private timerEvent?: Phaser.Time.TimerEvent;
  private interval?: number;
  private mappingList: TaskMappingItem[] = [];

  private onTask?: (task: Task) => boolean | Promise<boolean>;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init({ onTask, interval }: { onTask?: (task: Task) => boolean | Promise<boolean>; interval?: number }) {
    this.onTask = onTask;
    this.interval = interval || this.interval;
    this.mappingList = Object.values(this.scene.cache.json.get('config')[CONFIG_MAPPING_LIST_KEY]);
    // 監聽 global message queue，將 message 轉換為 task 並加入 task queue
    this.messageQueueState?.watch(this.handleMessageQueueChange);
    // 監聽 task queue 狀態，負責執行任務
    this.taskQueueState?.watch(this.handleTaskQueueChange);
  }

  // 處理 global message queue 轉換
  private handleMessageQueueChange = (messages: Message[]) => {
    if (!messages.length) return;
    const tasks: Task[] = [];
    let updated = false;
    messages.forEach(msg => {
      const result = filterFromMatchList(msg, this.mappingList);
      if (result) {
        tasks.push({ ...msg, ...result });
        updated = true;
      }
    });
    if (updated) {
      // 將轉換後的 task 加入 task queue，並清空 message queue
      const currentTasks = this.taskQueueState?.get() || [];
      setStoreState(TASK_QUEUE_STORE_KEY, [...currentTasks, ...tasks]);
      setStoreState(MESSAGE_QUEUE_STORE_KEY, []);
    }
  };

  // 處理 task queue 執行
  private handleTaskQueueChange = (tasks: Task[]) => {
    if (!this.timerEvent && tasks.length > 0) {
      this.startNextTask();
    }
  };

  addTask(task: Task) {
    const queue = this.taskQueueState?.get() || [];
    setStoreState(TASK_QUEUE_STORE_KEY, [...queue, task]);
  }

  addEmergentTask(task: Task) {
    const queue = this.taskQueueState?.get() || [];
    setStoreState(TASK_QUEUE_STORE_KEY, [task, ...queue]);
  }

  removeTask(index: number) {
    const queue = this.taskQueueState?.get() || [];
    if (index < 0 || index >= queue.length) return;
    queue.splice(index, 1);
    setStoreState(TASK_QUEUE_STORE_KEY, [...queue]);
  }

  clearQueue() {
    setStoreState(TASK_QUEUE_STORE_KEY, []);
  }

  private async startNextTask() {
    const queue = this.taskQueueState?.get() || [];
    if (queue.length === 0) return;

    const task = queue[0];

    // Retry 機制，最多重試 3 次
    let retryCount = 0;
    const maxRetry = 3;

    const handleTask = async () => {
      let success = false;
      try {
        if (this.onTask && 'action' in task) {
          success = await this.onTask(task as Task);
        }
      } catch (err) {
        console.error('TaskQueueHandler onTask error:', err);
        success = false;
      }
      if (success) {
        this.removeTask(0);
        retryCount = 0;
      } else {
        retryCount++;
        if (retryCount > maxRetry) {
          // 超過重試次數，直接移除，避免 queue 卡死
          console.warn('TaskQueueHandler: task failed too many times, removing from queue.', task);
          this.removeTask(0);
          retryCount = 0;
        } else {
          // 不移除，等下次 timer 再嘗試
          console.warn('TaskQueueHandler: task failed, will retry.', task);
        }
      }
      this.timerEvent = undefined;
      this.startNextTask();
    };

    this.timerEvent = this.scene.time.addEvent({
      delay: this.interval,
      callback: () => {
        handleTask();
      },
      loop: false,
    });
  }

  destroy() {
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = undefined;
    }
    this.messageQueueState?.unwatch(this.handleMessageQueueChange);
    this.taskQueueState?.unwatch(this.handleTaskQueueChange);
  }
}
