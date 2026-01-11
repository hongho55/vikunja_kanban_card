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

    get _view_id() {
        if (this.config) {
            return this.config.view_id || '';
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

    get _header_font_size() {
        if (this.config) {
            return this.config.header_font_size || '';
        }

        return '';
    }

    get _column_font_size() {
        if (this.config) {
            return this.config.column_font_size || '';
        }

        return '';
    }

    get _card_font_size() {
        if (this.config) {
            return this.config.card_font_size || '';
        }

        return '';
    }

    get _column_width() {
        if (this.config) {
            return this.config.column_width || '';
        }

        return '';
    }

    get _enable_drag() {
        if (this.config) {
            return (this.config.enable_drag === undefined) || (this.config.enable_drag !== false);
        }

        return true;
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
            const configValue = e.target.configValue;
            const sizeFields = ['header_font_size', 'column_font_size', 'card_font_size', 'column_width'];
            if (e.target.value === '') {
                if (!['entity'].includes(configValue)) {
                    delete this.config[configValue];
                }
            } else {
                this.config = {
                    ...this.config,
                    [configValue]: e.target.checked !== undefined
                        ? e.target.checked
                        : sizeFields.includes(configValue)
                            ? e.target.value
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
                    label="View ID (optional)"
                    .configValue=${'view_id'}
                    .value=${this._view_id}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-textfield
                    label="Header font size (optional)"
                    .configValue=${'header_font_size'}
                    .value=${this._header_font_size}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-textfield
                    label="Column font size (optional)"
                    .configValue=${'column_font_size'}
                    .value=${this._column_font_size}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-textfield
                    label="Card font size (optional)"
                    .configValue=${'card_font_size'}
                    .value=${this._card_font_size}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-textfield
                    label="Column width (optional)"
                    .configValue=${'column_width'}
                    .value=${this._column_width}
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

            <div class="option">
                <ha-switch
                    .checked=${this._enable_drag}
                    .configValue=${'enable_drag'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Enable drag and drop</span>
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
        this._htmlDragActive = false;
        this._pointerDrag = null;
        this._boundPointerMove = this._onPointerMove.bind(this);
        this._boundPointerUp = this._onPointerUp.bind(this);
        this._boundPointerCancel = this._onPointerCancel.bind(this);
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

    _resolveCssSize(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        if (typeof value === 'number') {
            return `${value}px`;
        }
        const trimmed = String(value).trim();
        if (!trimmed) {
            return null;
        }
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? `${parsed}px` : trimmed;
    }

    _styleString(styleMap) {
        return Object.entries(styleMap)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }

    _dragEnabled() {
        if (!this.config) {
            return true;
        }
        return (this.config.enable_drag === undefined) || (this.config.enable_drag !== false);
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

    _getViewId(state) {
        if (this.config.view_id !== undefined && this.config.view_id !== null && this.config.view_id !== '') {
            return this._normalizeId(this.config.view_id);
        }
        if (state && state.attributes) {
            if (state.attributes.view_id !== undefined && state.attributes.view_id !== null) {
                return this._normalizeId(state.attributes.view_id);
            }
            if (state.attributes.view && state.attributes.view.id !== undefined) {
                return this._normalizeId(state.attributes.view.id);
            }
        }
        return null;
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
            if (serviceDomain === 'vikunja' && serviceName === 'call_api') {
                data.payload = payload;
            } else {
                data.payload = JSON.stringify(payload);
            }
        }

        return this.hass.callService(serviceDomain, serviceName, data);
    }

    _refreshEntity() {
        return this.hass.callService('homeassistant', 'update_entity', {
            entity_id: this.config.entity,
        });
    }

    _moveTask(taskId, targetBucketId, state) {
        const stateObj = state || (this.hass && this.hass.states[this.config.entity]);
        if (!stateObj || !taskId || !targetBucketId) {
            return;
        }

        const projectId = this._getProjectId(stateObj);
        const viewId = this._getViewId(stateObj);
        const payload = {bucket_id: targetBucketId};
        let moveRequest;

        if (projectId && viewId) {
            moveRequest = this._callVikunja(
                'POST',
                `/projects/${projectId}/views/${viewId}/buckets/${targetBucketId}/tasks`,
                {task_id: taskId},
            ).catch(() => this._callVikunja('POST', `/tasks/${taskId}`, payload));
        } else {
            moveRequest = this._callVikunja('POST', `/tasks/${taskId}`, payload);
        }

        moveRequest
            .then(() => this._refreshEntity())
            .finally(() => {
                this.requestUpdate();
            });
    }

    _onDragStart(task, event) {
        if (!this._dragEnabled()) {
            return;
        }
        const taskId = this._normalizeId(task.id);
        if (!taskId) {
            event.preventDefault();
            return;
        }
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(taskId));
        this._htmlDragActive = true;
    }

    _onDragEnd() {
        this._htmlDragActive = false;
    }

    _onDragOver(event) {
        if (!this._dragEnabled()) {
            return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    _onDrop(bucket, event) {
        if (!this._dragEnabled()) {
            return;
        }
        event.preventDefault();
        const taskId = this._normalizeId(event.dataTransfer.getData('text/plain'));
        if (!taskId || !bucket || !bucket.id) {
            return;
        }
        const state = this.hass.states[this.config.entity] || undefined;
        if (!state) {
            return;
        }
        const tasks = this._getTasks();
        const task = tasks.find(item => this._normalizeId(item.id) == taskId);
        const currentBucketId = task ? this._normalizeId(task.bucket_id ?? task.section_id) : null;
        if (currentBucketId !== null && currentBucketId == bucket.id) {
            return;
        }
        this._moveTask(taskId, bucket.id, state);
    }

    _onPointerDown(task, event) {
        if (!this._dragEnabled() || this._htmlDragActive) {
            return;
        }
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        const taskId = this._normalizeId(task.id);
        if (!taskId) {
            return;
        }
        this._pointerDrag = {
            taskId,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            active: false,
        };
        window.addEventListener('pointermove', this._boundPointerMove);
        window.addEventListener('pointerup', this._boundPointerUp);
        window.addEventListener('pointercancel', this._boundPointerCancel);
    }

    _onPointerMove(event) {
        if (!this._pointerDrag || event.pointerId !== this._pointerDrag.pointerId) {
            return;
        }
        const dx = event.clientX - this._pointerDrag.startX;
        const dy = event.clientY - this._pointerDrag.startY;
        if (Math.hypot(dx, dy) > 6) {
            this._pointerDrag.active = true;
        }
    }

    _onPointerUp(event) {
        if (!this._pointerDrag || event.pointerId !== this._pointerDrag.pointerId) {
            return;
        }
        const pointerDrag = this._pointerDrag;
        this._pointerDrag = null;
        window.removeEventListener('pointermove', this._boundPointerMove);
        window.removeEventListener('pointerup', this._boundPointerUp);
        window.removeEventListener('pointercancel', this._boundPointerCancel);
        if (!pointerDrag.active || this._htmlDragActive) {
            return;
        }
        const bucketId = this._getBucketIdFromPoint(event.clientX, event.clientY);
        if (!bucketId) {
            return;
        }
        const state = this.hass.states[this.config.entity] || undefined;
        if (!state) {
            return;
        }
        const tasks = this._getTasks();
        const task = tasks.find(item => this._normalizeId(item.id) == pointerDrag.taskId);
        const currentBucketId = task ? this._normalizeId(task.bucket_id ?? task.section_id) : null;
        if (currentBucketId !== null && currentBucketId == bucketId) {
            return;
        }
        this._moveTask(pointerDrag.taskId, bucketId, state);
    }

    _onPointerCancel(event) {
        if (!this._pointerDrag || event.pointerId !== this._pointerDrag.pointerId) {
            return;
        }
        this._pointerDrag = null;
        window.removeEventListener('pointermove', this._boundPointerMove);
        window.removeEventListener('pointerup', this._boundPointerUp);
        window.removeEventListener('pointercancel', this._boundPointerCancel);
    }

    _getBucketIdFromPoint(x, y) {
        const root = this.shadowRoot;
        if (!root || !root.elementFromPoint) {
            return null;
        }
        const el = root.elementFromPoint(x, y);
        const bucketEl = el && el.closest ? el.closest('.kanban-block') : null;
        if (!bucketEl || !bucketEl.dataset || !bucketEl.dataset.bucketId) {
            return null;
        }
        return this._normalizeId(bucketEl.dataset.bucketId);
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
        const state = this.hass.states[this.config.entity] || undefined;
        const taskId = this._normalizeId(task.id);
        if (!state || !taskId || !buckets.length) {
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
        this._moveTask(taskId, targetBucket.id, state);
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
        const enableDrag = this._dragEnabled();
        const styleString = this._styleString({
            '--vkc-header-font-size': this._resolveCssSize(this.config.header_font_size),
            '--vkc-column-font-size': this._resolveCssSize(this.config.column_font_size),
            '--vkc-card-font-size': this._resolveCssSize(this.config.card_font_size),
            '--vkc-column-width': this._resolveCssSize(this.config.column_width),
        });

        return html`<ha-card class="${showHeader ? 'has-header' : ''} ${this._useDarkTheme ? 'dark': ''}" style="${styleString}">
            <div class="container">
                ${showHeader ? html`<h1 class="kanban-heading">${state.attributes.friendly_name}</h1>` : html``}

                <div class="kanban-board">
                    ${buckets.map((bucket, index) => html`
                        <div
                            class="kanban-block ${index === buckets.length - 1 ? 'last' : ''}"
                            data-bucket-id="${bucket.id}"
                            @dragover=${this._onDragOver}
                            @drop=${(event) => this._onDrop(bucket, event)}
                        >
                            <strong>${bucket.title}</strong>
                            <div class="vikunja-list" @dragover=${this._onDragOver} @drop=${(event) => this._onDrop(bucket, event)}>
                                ${bucket.items.map(task => {
                                    const title = this._taskTitle(task);
                                    const description = this._taskDescription(task);
                                    return html`
                                        <div
                                            class="card"
                                            .draggable=${enableDrag}
                                            @dragstart=${(event) => this._onDragStart(task, event)}
                                            @dragend=${this._onDragEnd}
                                            @pointerdown=${(event) => this._onPointerDown(task, event)}
                                        >
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
                                                    </ha-icon-button>`
                                                : html``}
                                            ${index < buckets.length - 1
                                                ? html`<ha-icon-button @click=${() => this.itemMove(task, 'right', buckets)}>
                                                        <ha-icon icon="mdi:arrow-right">
                                                        </ha-icon>
                                                    </ha-icon-button>`
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
            font-size: var(--vkc-header-font-size, 32px);
            color: var(--ha-card-header-color,--primary-text-color);
            margin-bottom: 16px;
        }

        .kanban-board {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            overflow-x: auto;
        }

        .kanban-block {
            width: var(--vkc-column-width, 100%);
            margin-right: 16px;
            border: 1px solid var(--secondary-background-color);
            border-radius: 10px;
            overflow-y: auto;
            font-family: Arial, sans-serif;
            font-size: var(--vkc-column-font-size, 18px);
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
            font-size: var(--vkc-card-font-size, inherit);
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
