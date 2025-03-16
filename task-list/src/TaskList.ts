import { html, css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

interface Task {
  content: string;
}

export class TaskList extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--task-list-text-color, #000);

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;

        td {
          border: 1px solid var(--task-list-border-color, #333);
          padding: 8px;
        }

        td:nth-child(1) {
          width: 25px;
          text-align: center;
        }
        td:nth-child(3) {
          width: 25px;
          text-align: center;
        }

        tfoot input {
          width: 100%;
          box-sizing: border-box;
        }
      }
    }
  `;

  @property({ type: Array<Task> }) tasks: Task[] = [];

  private get _newTaskInput(): HTMLInputElement {
    return this.renderRoot.querySelector('[name=new-task]') as HTMLInputElement;
  }

  private __onInput(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.__add();
    }
  }

  private __add() {
    const newTaskContent = this._newTaskInput.value ?? '';

    if (newTaskContent.length > 0) {
      this.tasks = [
        ...this.tasks,
        {
          content: newTaskContent,
        },
      ];

      this._newTaskInput.value = '';
    }
  }

  private __remove(task: Task) {
    this.tasks = this.tasks.filter(t => t !== task);
  }

  render() {
    return html`
      <h2><slot>Task List</slot></h2>
      <table>
        <tbody>
          ${this.tasks.length === 0
            ? html`<td colspan="3">No tasks yet</td>`
            : ''}
          ${this.tasks.map(
            (task, i) =>
              html` <tr>
                <td>${i + 1}</td>
                <td>${task.content}</td>
                <td><button @click=${() => this.__remove(task)}>X</button></td>
              </tr>`,
          )}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td colspan>
              <input
                type="text"
                name="new-task"
                id="new-task"
                autocomplete="off"
                placeholder="Add Task"
                @keyup=${this.__onInput}
              />
            </td>
            <td>
              <button @click=${this.__add}>+</button>
            </td>
          </tr>
        </tfoot>
      </table>
    `;
  }
}
