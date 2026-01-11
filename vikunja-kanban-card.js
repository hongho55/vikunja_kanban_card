import {LitElement, html, css} from 'https://unpkg.com/lit-element@3.3.3/lit-element.js?module';

class VikunjaKanbanCardEditor extends LitElement {
    static get properties() {
        return {
            hass: Object,
            config: Object,
        };
    }

    get _entity() {
        if (this.config) {
            return this.config.entity || '';
        }

        return '';
    }

    get _project_id() {
        if (this.config) {
            return this.config.project_id || '';
        }

        return '';
    }

    get _default_bucket_id() {
        if (this.config) {
            return this.config.default_bucket_id || '';
        }

        return '';
    }

    get _service_domain() {
        if (this.config) {
            return this.config.service_domain || '';
        }

        return '';
    }

    get _service_name() {
        if (this.config) {
            return this.config.service_name || '';
        }

        return '';
    }

    get _show_header() {
        if (this.config) {
            return this.config.show_header || true;
        }

        return true;
    }

    get _show_item_add() {
        if (this.config) {
            return this.config.show_item_add || true;
        }

        return true;
    }

    get _show_item_delete() {
        if (this.config) {
            return this.config.show_item_delete || true;
        }

        return true;
    }

    get _only_today_overdue() {
        if (this.config) {
            return this.config.only_today_overdue || false;
        }

        return false;
    }

    setConfig(config) {
        this.config = config;
    }

    configChanged(config) {
        const e = new Event('config-changed', {
            bubbles: true,
            composed: true,
        });

        e.detail = {config: config};

        this.dispatchEvent(e);
    }

    getEntitiesByType(type) {
        return this.hass
            ? Object.keys(this.hass.states).filter(entity => entity.substr(0, entity.indexOf('.')) === type)
            : [];
    }

    isNumeric(v) {
        return !isNaN(parseFloat(v)) && isFinite(v);
    }

    valueChanged(e) {
        if (
            !this.config
            || !this.hass
            || (this[`_${e.target.configValue}`] === e.target.value)
        ) {
            return;
        }

        if (e.target.configValue) {
            if (e.target.value === '') {
                if (!['entity'].includes(e.target.configValue)) {
                    delete this.config[e.target.configValue];
                }
            } else {
                this.config = {
                    ...this.config,
                    [e.target.configValue]: e.target.checked !== undefined
                        ? e.target.checked
                        : this.isNumeric(e.target.value) ? parseFloat(e.target.value) : e.target.value,
                };
            }
        }

        this.configChanged(this.config);
    }

    render() {
        if (!this.hass) {
            return html``;
        }

        const entities = this.getEntitiesByType('sensor');

        return html`<div class="card-config">
            <div class="option">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Entity (required)"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'entity'}
                    .value=${this._entity}
                >
                    ${entities.map(entity => {
                        return html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`;
                    })}
                </ha-select>
            </div>

            <div class="option">
                <ha-textfield
                    label="Project ID (optional)"
                    .configValue=${'project_id'}
                    .value=${this._project_id}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-textfield
                    label="Default bucket ID (optional)"
                    .configValue=${'default_bucket_id'}
                    .value=${this._default_bucket_id}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-textfield
                    label="Service domain (default: vikunja)"
                    .configValue=${'service_domain'}
                    .value=${this._service_domain}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-textfield
                    label="Service name (default: call_api)"
                    .configValue=${'service_name'}
                    .value=${this._service_name}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-switch
                    .checked=${(this.config.show_header === undefined) || (this.config.show_header !== false)}
                    .configValue=${'show_header'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show header</span>
            </div>

            <div class="option">
                <ha-switch
                    .checked=${(this.config.show_item_add === undefined) || (this.config.show_item_add !== false)}
                    .configValue=${'show_item_add'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show text input element for adding new tasks</span>
            </div>

            <div class="option">
                <ha-switch
                    .checked=${(this.config.show_item_delete === undefined) || (this.config.show_item_delete !== false)}
                    .configValue=${'show_item_delete'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show "delete" buttons</span>
            </div>
            <div class="option" style="font-size: 0.7rem; margin: -12px 0 0 45px">
                <span>
                    * Only shown in the last column.
                </span>
            </div>

            <div class="option">
                <ha-switch
                    .checked=${(this.config.only_today_overdue !== undefined) && (this.config.only_today_overdue !== false)}
                    .configValue=${'only_today_overdue'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Only show today or overdue</span>
            </div>
        </div>`;
    }

    static get styles() {
        return css`
            .card-config ha-select {
                width: 100%;
            }

            .option {
                display: flex;
                align-items: center;
                padding: 5px;
            }

            .option ha-switch {
                margin-right: 10px;
            }
        `;
    }
}


class VikunjaKanbanCard extends LitElement {
    constructor() {
        super();

        this._useDarkTheme = VikunjaKanbanCard.isDarkTheme();
    }

    static get properties() {
        return {
            hass: Object,
            config: Object,
        };
    }

    static getConfigElement() {
        return document.createElement('vikunja-kanban-card-editor');
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error('Entity is not set!');
        }

        this.config = config;
    }

    getCardSize() {
        return this.hass ? (this._getTasks().length || 1) : 1;
    }

    _normalizeId(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : value;
    }

    _getProjectId(state) {
        if (this.config.project_id !== undefined && this.config.project_id !== null && this.config.project_id !== '') {
            return this._normalizeId(this.config.project_id);
        }
        if (state && state.attributes) {
            if (state.attributes.project_id !== undefined && state.attributes.project_id !== null) {
                return this._normalizeId(state.attributes.project_id);
            }
            if (state.attributes.project && state.attributes.project.id !== undefined) {
                return this._normalizeId(state.attributes.project.id);
            }
        }
        return this._normalizeId(state.state);
    }

    _getBuckets(state) {
        const rawBuckets = state.attributes.buckets || state.attributes.sections || [];
        return rawBuckets.map((bucket, index) => {
            const title = bucket.title || bucket.name || `Column ${index + 1}`;
            const id = this._normalizeId(bucket.id ?? bucket.bucket_id ?? index);
            return {
                ...bucket,
                title,
                id,
            };
        });
    }

    _getTasksFromBuckets(buckets) {
        if (!buckets.length) {
            return [];
        }
        const tasks = [];
        for (const bucket of buckets) {
            if (!Array.isArray(bucket.tasks)) {
                continue;
            }
            for (const task of bucket.tasks) {
                tasks.push({
                    ...task,
                    bucket_id: task.bucket_id ?? bucket.id,
                });
            }
        }
        return tasks;
    }

    _getTasks() {
        const state = this.hass.states[this.config.entity] || undefined;
        if (!state) {
            return [];
        }

        let tasks = state.attributes.tasks || state.attributes.items || [];
        if (!Array.isArray(tasks) || tasks.length === 0) {
            const buckets = this._getBuckets(state);
            tasks = this._getTasksFromBuckets(buckets);
        }
        return Array.isArray(tasks) ? tasks : [];
    }

    _taskTitle(task) {
        return task.title || task.content || task.name || 'Untitled';
    }

    _taskDescription(task) {
        return task.description || task.notes || '';
    }

    _taskDueDate(task) {
        if (task.due_date) {
            return task.due_date;
        }
        if (task.due && task.due.date) {
            return task.due.date;
        }
        return null;
    }

    _callVikunja(method, path, payload) {
        const serviceDomain = this.config.service_domain || 'vikunja';
        const serviceName = this.config.service_name || 'call_api';
        const data = {
            method,
            path,
        };

        if (payload !== undefined) {
            data.payload = JSON.stringify(payload);
        }

        return this.hass.callService(serviceDomain, serviceName, data);
    }

    _refreshEntity() {
        return this.hass.callService('homeassistant', 'update_entity', {
            entity_id: this.config.entity,
        });
    }

    itemAdd() {
        const input = this.shadowRoot.getElementById('vikunja-card-item-add');
        const state = this.hass.states[this.config.entity] || undefined;
        const value = input.value.trim();

        if (!state) {
            return;
        }

        const projectId = this._getProjectId(state);
        if (!projectId || !value) {
            return;
        }

        const buckets = this._getBuckets(state);
        const defaultBucketId = this._normalizeId(this.config.default_bucket_id)
            ?? (buckets.length ? buckets[0].id : null);

        const payload = {title: value};
        if (defaultBucketId) {
            payload.bucket_id = defaultBucketId;
        }

        this._callVikunja('PUT', `/projects/${projectId}/tasks`, payload)
            .then(() => {
                input.value = '';
                return this._refreshEntity();
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    keyUp(e) {
        if (e.which === 13) {
            this.itemAdd();
        }
    }

    itemDelete(task) {
        const taskId = this._normalizeId(task.id);
        if (!taskId) {
            return;
        }

        this._callVikunja('DELETE', `/tasks/${taskId}`)
            .then(() => this._refreshEntity())
            .finally(() => {
                this.requestUpdate();
            });
    }

    itemMove(task, direction, buckets) {
        const taskId = this._normalizeId(task.id);
        if (!taskId || !buckets.length) {
            return;
        }

        const currentBucketId = this._normalizeId(task.bucket_id ?? task.section_id);
        const currentIndex = buckets.findIndex(bucket => bucket.id == currentBucketId);
        if (currentIndex < 0) {
            return;
        }

        const targetIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= buckets.length) {
            return;
        }

        const targetBucket = buckets[targetIndex];
        const payload = {bucket_id: targetBucket.id};

        this._callVikunja('POST', `/tasks/${taskId}`, payload)
            .then(() => this._refreshEntity())
            .finally(() => {
                this.requestUpdate();
            });
    }

    render() {
        const state = this.hass.states[this.config.entity] || undefined;

        if (!state) {
            return html``;
        }

        let tasks = this._getTasks();
        let buckets = this._getBuckets(state);

        if (this.config.only_today_overdue) {
            tasks = tasks.filter(task => {
                const due = this._taskDueDate(task);
                if (!due) {
                    return false;
                }

                let value = due;
                if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    value += 'T00:00:00';
                }

                return (new Date()).setHours(23, 59, 59, 999) >= (new Date(value)).getTime();
            });
        }

        if (!buckets.length) {
            buckets = [{
                id: 'default',
                title: state.attributes.friendly_name || 'Tasks',
                tasks: tasks,
            }];
        }

        buckets = buckets.map(bucket => {
            const bucketTasks = bucket.tasks
                ? bucket.tasks
                : tasks.filter(task => (task.bucket_id ?? task.section_id) == bucket.id);
            return {
                ...bucket,
                items: bucketTasks,
            };
        });

        const showHeader = this.config.show_header ?? true;

        return html`<ha-card class="${showHeader ? 'has-header' : ''} ${this._useDarkTheme ? 'dark': ''}">
            <div class="container">
                ${showHeader ? html`<h1 class="kanban-heading">${state.attributes.friendly_name}</h1>` : html``}

                <div class="kanban-board">
                    ${buckets.map((bucket, index) => html`
                        <div class="kanban-block ${index === buckets.length - 1 ? 'last' : ''}">
                            <strong>${bucket.title}</strong>
                            <div class="vikunja-list">
                                ${bucket.items.map(task => {
                                    const title = this._taskTitle(task);
                                    const description = this._taskDescription(task);
                                    return html`
                                        <div class="card">
                                            ${description
                                                ? html`<div class="card-content">
                                                    <span class="vikunja-item-content">${title}</span>
                                                    <span class="vikunja-item-description">${description}</span>
                                                </div>`
                                                : html`<span class="card-content">${title}</span>`}
                                            ${index > 0
                                                ? html`<ha-icon-button @click=${() => this.itemMove(task, 'left', buckets)}>
                                                        <ha-icon icon="mdi:arrow-left">
                                                        </ha-icon>
                                                    </button>`
                                                : html``}
                                            ${index < buckets.length - 1
                                                ? html`<ha-icon-button @click=${() => this.itemMove(task, 'right', buckets)}>
                                                        <ha-icon icon="mdi:arrow-right">
                                                        </ha-icon>
                                                    </button>`
                                                : html``}
                                            ${index === buckets.length - 1 && ((this.config.show_item_delete === undefined) || (this.config.show_item_delete !== false))
                                                ? html`<ha-icon-button
                                                            class="vikunja-item-delete"
                                                            @click=${() => this.itemDelete(task)}>
                                                            <ha-icon icon="mdi:close"></ha-icon>
                                                        </ha-icon-button>`
                                                : html``}
                                        </div>
                                    `;
                                })}
                                </div>
                            ${index === 0 && ((this.config.show_item_add === undefined) || (this.config.show_item_add !== false))
                                ? html`<footer class="vikunja-list-add-row">
                                            <ha-textfield
                                            id="vikunja-card-item-add"
                                            type="text"
                                            class="vikunja-item-add"
                                            placeholder="Add task"
                                            enterkeyhint="enter"
                                            @keyup=${this.keyUp}
                                        ></ha-textfield>
                                        <ha-icon-button
                                            class="vikunja-item-add-btn"
                                            @click=${this.itemAdd}
                                        >
                                            <ha-icon icon="mdi:plus"></ha-icon>
                                        </ha-icon-button>
                                    </footer>`
                                : html``}
                        </div>`
                    )}
                </div>
            </div>
        </ha-card>`;
    }

    useDarkTheme(darkTheme) {
        this._useDarkTheme = darkTheme;
        this.requestUpdate();
    }

    static isDarkTheme() {
        try {
            const meta = document.querySelector("meta[name='theme-color']");
            return meta.content !== "#03a9f4";
        } catch {
            return false;
        }
    }

    static get styles() {
        return css`
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .container {
            width: calc(100% - 20px);
            margin: 20px auto;
        }

        .kanban-heading {
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 32px;
            color: var(--ha-card-header-color,--primary-text-color);
            margin-bottom: 16px;
        }

        .kanban-board {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .kanban-block {
            width: 100%;
            margin-right: 16px;
            border: 1px solid var(--secondary-background-color);
            border-radius: 10px;
            overflow-y: auto;
            font-family: Arial, sans-serif;
            font-size: 18px;
            color: var(--ha-card-header-color,--primary-text-color);
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }

        .dark .kanban-block {
            border: 1px solid var(--primary-background-color);
        }

        .kanban-block.last {
            margin-right: 0;
        }

        .vikunja-list-add-row {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-bottom: 10px;
        }

        .kanban-block strong {
            display: block;
            text-align: center;
            padding: 10px;
            background-color: var(--secondary-background-color);
            margin-bottom: 10px;
        }

        .dark .kanban-block strong {
            background-color: var(--primary-background-color);
        }

        .kanban-block ul {
            list-style: none;
        }

        .vikunja-list {
            display: flex;
            flex-direction: column;
            min-height: 82px;
            height: 100%;
            overflow: auto;
        }

        .card {
            padding: 10px;
            margin: 0px 10px 10px 10px;
            border-radius: 5px;
            background-color: var(--primary-background-color);
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: row;
            align-items: center;
        }

        .dark .card {
            background-color: var(--secondary-background-color);
        }

        .card-content {
            width: 100%;
            display: flex;
            flex-direction: column;
        }

        .vikunja-item-description {
            font-size: x-small;
        }

        .vikunja-item-add {
            padding: 0px 5px 0px 16px;
        }

        .vikunja-item-add {
            width: 100%;
            line-height: 9px;
            height: 3rem;
        }

        .vikunja-item ha-icon-button ha-icon {
            margin-top: -10px;
        }
        `;
    }
}

customElements.define('vikunja-kanban-card-editor', VikunjaKanbanCardEditor);
customElements.define('vikunja-kanban-card', VikunjaKanbanCard);

window.customCards = window.customCards || [];
window.customCards.push({
    preview: true,
    type: 'vikunja-kanban-card',
    name: 'Vikunja Kanban Card',
    description: 'Custom card for displaying projects from Vikunja in a Kanban format.',
});

console.info(
    '%c VIKUNJA-KANBAN-CARD ',
    'color: white; background: #5f7c8a; font-weight: 700',
);
