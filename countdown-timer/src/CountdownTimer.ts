import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

enum TimerStatus {
  IDLE,
  RUNNING,
  FINISHED,
}

function formatTimeSegment(input: number): string {
  return input < 10 ? `0${input}` : input.toString();
}

export class CountdownTimer extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--countdown-timer-text-color, #000);

      h2 {
        text-align: center;
      }

      .clock-face {
        border: var(--countdown-timer-border, 1px solid #000);
        align-content: center;
        text-align: center;
        height: 100px;
        font-family: 'Orbitron', 'Digital-7', monospace;
        font-size: 80px;
        white-space: nowrap;
        margin: 10px 0;
      }

      .buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;

        button {
          border: 3px dashed transparent;

          &.active {
            border: 3px dashed black;
          }
          &.start {
            background-color: #4caf50;

            &:hover {
              background-color: #27712a;
            }
          }

          &.pause {
            background-color: #ccc;
            &:hover {
              background-color: #aaa;
            }
          }

          &.reset {
            background-color: #faa;
            &:hover {
              background-color: #f00;
            }
          }

          display: flex;
          align-items: center; /* Vertically center the icon and text */

          color: white; /* White text */
          padding: 5px 15px; /* Adjust padding for better layout */
          font-size: 16px;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s;
          height: 30px;

          i {
            font-style: normal;
            font-size: 20px;
            margin-right: 8px; /* Space between the icon and text */
          }
        }
      }
    }
  `;

  @property({ type: Number }) minutes = 5;

  @state()
  private _timeLeft: number = 0;

  @state()
  private _status: TimerStatus = TimerStatus.IDLE;

  private _previousHeartbeatTime: number = 0;

  private _heartbeatInterval: ReturnType<typeof setTimeout> | null = null;

  firstUpdated() {
    setTimeout(() => this.__reset());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__stopHeartbeat();
  }

  private __start() {
    if (this._status === TimerStatus.IDLE) {
      this.__startHeartbeat();

      this._status = TimerStatus.RUNNING;
    }
  }

  private __pause() {
    if (this._status === TimerStatus.RUNNING) {
      this.__stopHeartbeat();

      this._status = TimerStatus.IDLE;
    }
  }

  private __reset() {
    this.__stopHeartbeat();
    this._timeLeft = this.minutes * 60 * 1000;

    this._status = TimerStatus.IDLE;
  }

  private __finish() {
    this.__stopHeartbeat();
    this.dispatchEvent(new CustomEvent('countdown-finished'));

    this._status = TimerStatus.FINISHED;
  }

  private __startHeartbeat() {
    this._previousHeartbeatTime = Date.now();
    if (!this._heartbeatInterval) {
      this._heartbeatInterval = setInterval(() => this.__heartbeat(), 100);
    }
  }

  private __stopHeartbeat() {
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
  }

  private __heartbeat() {
    const now = Date.now();
    const timePassed = now - this._previousHeartbeatTime;

    this._previousHeartbeatTime = now;
    this._timeLeft -= timePassed;

    if (this._timeLeft < 0) {
      this._timeLeft = 0;
    }

    if (this._timeLeft === 0) {
      this.__finish();
    }
  }

  render() {
    const minutes = Math.floor(this._timeLeft / 1000 / 60);
    const seconds = Math.floor(this._timeLeft / 1000) % 60;

    return html`
      <h2>${this.minutes} minute${this.minutes === 1 ? '' : 's'} timer</h2>

      <div class="clock-face">
        ${formatTimeSegment(minutes)}:${formatTimeSegment(seconds)}
      </div>

      <div class="buttons">
        <button
          class=${`start${this._status === TimerStatus.RUNNING ? ' active' : ''}`}
          @click=${this.__start}
        >
          <i>⏵</i>start
        </button>
        <button
          class=${`pause${this._status === TimerStatus.IDLE ? ' active' : ''}`}
          @click=${this.__pause}
        >
          <i>⏸︎</i> pause
        </button>
        <button class="reset" @click=${this.__reset}><i>↺</i> reset</button>
      </div>
    `;
  }
}
