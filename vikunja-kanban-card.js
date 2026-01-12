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
            return this.config.show_header ?? true;
        }

        return true;
    }

    get _show_item_add() {
        if (this.config) {
            return this.config.show_item_add ?? true;
        }

        return true;
    }

    get _item_action() {
        if (this.config) {
            if (this.config.item_action) {
                return this.config.item_action;
            }
            if (this.config.show_item_delete !== undefined) {
                return this.config.show_item_delete ? 'delete' : 'done';
            }
        }
        return 'done';
    }

    get _only_today_overdue() {
        if (this.config) {
            return this.config.only_today_overdue || false;
        }

        return false;
    }

    get _due_sort() {
        if (this.config) {
            if (this.config.due_sort) {
                return this.config.due_sort;
            }
            if (this.config.due_first) {
                return 'due_first';
            }
        }

        return '';
    }

    get _show_labels() {
        if (this.config) {
            return (this.config.show_labels === undefined) || (this.config.show_labels !== false);
        }

        return true;
    }

    get _label_filter() {
        if (this.config) {
            return this.config.label_filter || '';
        }

        return '';
    }

    get _compact_mode() {
        if (this.config) {
            return this.config.compact_mode || false;
        }

        return false;
    }

    get _hide_done_bucket() {
        if (this.config) {
            return this.config.hide_done_bucket || false;
        }

        return false;
    }

    get _done_bucket_title() {
        if (this.config) {
            return this.config.done_bucket_title || '';
        }

        return '';
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
        if (!this.config || !this.hass) {
            return;
        }

        const target = e.target;
        if (!target || !target.configValue) {
            return;
        }

        const configValue = target.configValue;
        const sizeFields = ['header_font_size', 'column_font_size', 'card_font_size', 'column_width'];
        const hasChecked = target.checked !== undefined;
        const nextValue = hasChecked ? target.checked : target.value;

        if (!hasChecked && this[`_${configValue}`] === nextValue) {
            return;
        }

        if (!hasChecked) {
            const isEmptyString = typeof nextValue === 'string' && nextValue.trim() === '';
            if (nextValue === undefined || nextValue === null || isEmptyString) {
                if (!['entity'].includes(configValue)) {
                    const nextConfig = {...this.config};
                    delete nextConfig[configValue];
                    this.config = nextConfig;
                }
                this.configChanged(this.config);
                return;
            }
        }

        this.config = {
            ...this.config,
            [configValue]: hasChecked
                ? target.checked
                : sizeFields.includes(configValue)
                    ? nextValue
                    : this.isNumeric(nextValue) ? parseFloat(nextValue) : nextValue,
        };

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
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Item action"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'item_action'}
                    .value=${this._item_action}
                >
                    <mwc-list-item value="done">Checkbox (done)</mwc-list-item>
                    <mwc-list-item value="delete">Delete button (last column)</mwc-list-item>
                </ha-select>
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
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Due sorting"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'due_sort'}
                    .value=${this._due_sort}
                >
                    <mwc-list-item .value="">None</mwc-list-item>
                    <mwc-list-item .value="due_first">Due first</mwc-list-item>
                    <mwc-list-item .value="date_asc">Due date (ascending)</mwc-list-item>
                </ha-select>
            </div>

            <div class="option">
                <ha-switch
                    .checked=${this._show_labels}
                    .configValue=${'show_labels'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Show label chips</span>
            </div>

            <div class="option">
                <ha-textfield
                    label="Label filter (comma-separated, optional)"
                    .configValue=${'label_filter'}
                    .value=${this._label_filter}
                    @input=${this.valueChanged}
                ></ha-textfield>
            </div>

            <div class="option">
                <ha-switch
                    .checked=${(this.config.compact_mode !== undefined) && (this.config.compact_mode !== false)}
                    .configValue=${'compact_mode'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Compact mode</span>
            </div>

            <div class="option">
                <ha-switch
                    .checked=${(this.config.hide_done_bucket !== undefined) && (this.config.hide_done_bucket !== false)}
                    .configValue=${'hide_done_bucket'}
                    @change=${this.valueChanged}
                >
                </ha-switch>
                <span>Hide done column</span>
            </div>

            <div class="option">
                <ha-textfield
                    label="Done column title override (optional)"
                    .configValue=${'done_bucket_title'}
                    .value=${this._done_bucket_title}
                    @input=${this.valueChanged}
                ></ha-textfield>
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
        this._optimisticTasks = new Map();
        this._lastEntityUpdated = null;
        this._lastEntityId = null;
        this._refreshTimer = null;
        this._optimisticTtlMs = 8000;
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
        this._lastEntityId = config.entity;
        this._lastEntityUpdated = null;
        this._optimisticTasks = new Map();
    }

    updated(changedProperties) {
        if (changedProperties.has('hass')) {
            const hassDark = this.hass?.themes?.darkMode;
            this._useDarkTheme = hassDark === undefined
                ? VikunjaKanbanCard.isDarkTheme()
                : hassDark;

            const entityId = this.config?.entity;
            if (entityId) {
                if (this._lastEntityId && this._lastEntityId !== entityId) {
                    this._lastEntityId = entityId;
                    this._lastEntityUpdated = null;
                    this._optimisticTasks = new Map();
                }
                const state = this.hass?.states?.[entityId];
                const stamp = state?.last_updated || state?.last_changed || null;
                if (stamp && stamp !== this._lastEntityUpdated) {
                    this._lastEntityUpdated = stamp;
                    this._reconcileOptimistic(state);
                }
            }
        }
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

    _getItemAction() {
        if (this.config && this.config.item_action) {
            return this.config.item_action;
        }
        if (this.config && this.config.show_item_delete !== undefined) {
            return this.config.show_item_delete ? 'delete' : 'done';
        }
        return 'done';
    }

    _getDoneBucketId(state) {
        if (!state || !state.attributes) {
            return null;
        }
        const attrs = state.attributes;
        if (attrs.done_bucket_id !== undefined && attrs.done_bucket_id !== null) {
            return this._normalizeId(attrs.done_bucket_id);
        }
        if (attrs.view && attrs.view.done_bucket_id !== undefined) {
            return this._normalizeId(attrs.view.done_bucket_id);
        }
        if (attrs.view && attrs.view.done_bucket && attrs.view.done_bucket.id !== undefined) {
            return this._normalizeId(attrs.view.done_bucket.id);
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

    _getRawTasks(state) {
        const stateObj = state || this.hass.states[this.config.entity] || undefined;
        if (!stateObj) {
            return [];
        }

        let tasks = stateObj.attributes.tasks || stateObj.attributes.items || [];
        if (!Array.isArray(tasks) || tasks.length === 0) {
            const buckets = this._getBuckets(stateObj);
            tasks = this._getTasksFromBuckets(buckets);
        }
        return Array.isArray(tasks) ? tasks : [];
    }

    _getTasks() {
        const state = this.hass.states[this.config.entity] || undefined;
        if (!state) {
            return [];
        }

        const normalized = this._getRawTasks(state);
        return this._applyOptimisticTasks(normalized);
    }

    _applyOptimisticTasks(tasks) {
        if (!Array.isArray(tasks) || !this._optimisticTasks || this._optimisticTasks.size === 0) {
            return tasks;
        }
        const now = Date.now();
        const updated = [];
        for (const task of tasks) {
            const taskId = this._normalizeId(task.id);
            if (!taskId) {
                updated.push(task);
                continue;
            }
            let override = this._optimisticTasks.get(taskId);
            if (override && override.updatedAt && now - override.updatedAt > this._optimisticTtlMs) {
                this._optimisticTasks.delete(taskId);
                override = null;
            }
            if (!override) {
                updated.push(task);
                continue;
            }
            if (override.deleted) {
                continue;
            }
            updated.push({
                ...task,
                ...(override.bucket_id !== undefined ? {bucket_id: override.bucket_id} : {}),
                ...(override.done !== undefined ? {done: override.done} : {}),
            });
        }
        return updated;
    }

    _setOptimisticTask(taskId, updates) {
        if (!taskId) {
            return;
        }
        if (!this._optimisticTasks) {
            this._optimisticTasks = new Map();
        }
        const existing = this._optimisticTasks.get(taskId) || {};
        this._optimisticTasks.set(taskId, {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
        });
    }

    _reconcileOptimistic(state) {
        if (!this._optimisticTasks || this._optimisticTasks.size === 0 || !state) {
            return;
        }
        const now = Date.now();
        const tasks = this._getRawTasks(state);
        const taskMap = new Map();
        for (const task of tasks) {
            const taskId = this._normalizeId(task.id);
            if (taskId) {
                taskMap.set(taskId, task);
            }
        }
        for (const [taskId, override] of this._optimisticTasks.entries()) {
            if (override.updatedAt && now - override.updatedAt > this._optimisticTtlMs) {
                this._optimisticTasks.delete(taskId);
                continue;
            }
            const task = taskMap.get(taskId);
            if (override.deleted) {
                if (!task) {
                    this._optimisticTasks.delete(taskId);
                }
                continue;
            }
            if (!task) {
                continue;
            }
            let matched = true;
            if (override.bucket_id !== undefined) {
                const currentBucketId = this._normalizeId(task.bucket_id ?? task.section_id);
                if (currentBucketId != override.bucket_id) {
                    matched = false;
                }
            }
            if (override.done !== undefined && Boolean(task.done) !== Boolean(override.done)) {
                matched = false;
            }
            if (matched) {
                this._optimisticTasks.delete(taskId);
            }
        }
    }

    _queueRefresh() {
        if (this._refreshTimer) {
            clearTimeout(this._refreshTimer);
        }
        this._refreshTimer = setTimeout(() => {
            this._refreshTimer = null;
            this._refreshEntity();
        }, 500);
    }

    itemDelete(task) {
        const taskId = this._normalizeId(task.id);
        if (!taskId) {
            return;
        }

        this._setOptimisticTask(taskId, {deleted: true});
        this.requestUpdate();

        this._callVikunja('DELETE', `/tasks/${taskId}`)
            .finally(() => {
                this._queueRefresh();
                this.requestUpdate();
            });
    }

    _parseLabelFilter(value) {
        if (!value) {
            return {titles: new Set(), ids: new Set()};
        }
        const items = Array.isArray(value)
            ? value
            : String(value).split(',');
        const titles = new Set();
        const ids = new Set();
        for (const item of items) {
            const trimmed = String(item || '').trim();
            if (!trimmed) {
                continue;
            }
            const numeric = Number(trimmed);
            if (Number.isFinite(numeric)) {
                ids.add(numeric);
            } else {
                titles.add(trimmed.toLowerCase());
            }
        }
        return {titles, ids};
    }

    _getTaskLabels(task) {
        if (!task || !Array.isArray(task.labels)) {
            return [];
        }
        return task.labels.filter(label => label && (label.title || label.id));
    }

    _taskMatchesLabelFilter(task, labelFilter) {
        if (!labelFilter || (labelFilter.titles.size === 0 && labelFilter.ids.size === 0)) {
            return true;
        }
        const labels = this._getTaskLabels(task);
        if (!labels.length) {
            return false;
        }
        return labels.some(label => {
            const labelId = this._normalizeId(label.id);
            if (labelId !== null && labelFilter.ids.has(labelId)) {
                return true;
            }
            const labelTitle = String(label.title || '').toLowerCase();
            return labelTitle && labelFilter.titles.has(labelTitle);
        });
    }

    _filterTasksByLabel(tasks, labelFilter) {
        if (!Array.isArray(tasks)) {
            return [];
        }
        if (!labelFilter || (labelFilter.titles.size === 0 && labelFilter.ids.size === 0)) {
            return tasks;
        }
        return tasks.filter(task => this._taskMatchesLabelFilter(task, labelFilter));
    }

    _sortTasksByDue(tasks) {
        if (!Array.isArray(tasks)) {
            return [];
        }
        const mode = this._getDueSortMode();
        if (mode === 'none') {
            return tasks;
        }
        const withIndex = tasks.map((task, index) => {
            const due = this._taskDueDate(task);
            const timestamp = this._dueTimestamp(due);
            return {
                task,
                index,
                hasDue: Boolean(due),
                timestamp,
            };
        });

        withIndex.sort((a, b) => {
            if (a.hasDue && !b.hasDue) {
                return -1;
            }
            if (!a.hasDue && b.hasDue) {
                return 1;
            }
            if (mode === 'date_asc' && a.hasDue && b.hasDue) {
                if (a.timestamp !== b.timestamp) {
                    return a.timestamp - b.timestamp;
                }
            }
            return a.index - b.index;
        });

        return withIndex.map(item => item.task);
    }

    _parseTitleList(value) {
        if (!value) {
            return new Set();
        }
        const items = Array.isArray(value)
            ? value
            : String(value).split(',');
        const titles = new Set();
        for (const item of items) {
            const trimmed = String(item || '').trim();
            if (!trimmed) {
                continue;
            }
            titles.add(trimmed.toLowerCase());
        }
        return titles;
    }

    _filterBucketsByDone(buckets) {
        if (!Array.isArray(buckets)) {
            return [];
        }
        if (!this.config || !this.config.hide_done_bucket) {
            return buckets;
        }
        const overrideTitles = this._parseTitleList(this.config.done_bucket_title);
        const doneTitles = overrideTitles.size
            ? overrideTitles
            : new Set(['done', 'completed', '완료', '완료됨']);
        return buckets.filter(bucket => {
            const title = String(bucket.title || bucket.name || '').trim().toLowerCase();
            if (!title) {
                return true;
            }
            return !doneTitles.has(title);
        });
    }

    _taskTitle(task) {
        return task.title || task.content || task.name || 'Untitled';
    }

    _taskDescription(task) {
        return task.description || task.notes || '';
    }

    _taskDueDate(task) {
        let value = null;
        if (task.due_date) {
            value = task.due_date;
        } else if (task.due && task.due.date) {
            value = task.due.date;
        }
        if (!value) {
            return null;
        }
        const asString = String(value);
        if (asString.startsWith('0001-01-01')) {
            return null;
        }
        return asString;
    }

    _formatDueDate(value) {
        if (!value) {
            return '';
        }
        const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
        return match ? match[0].replace(/-/g, '.') : String(value);
    }

    _getDueSortMode() {
        if (!this.config) {
            return 'none';
        }
        const mode = String(this.config.due_sort || '').trim();
        if (mode) {
            return mode;
        }
        return this.config.due_first ? 'due_first' : 'none';
    }

    _dueTimestamp(value) {
        if (!value) {
            return Number.POSITIVE_INFINITY;
        }
        const parsed = Date.parse(value);
        if (Number.isNaN(parsed)) {
            return Number.POSITIVE_INFINITY;
        }
        return parsed;
    }

    _labelColor(label) {
        if (!label) {
            return '';
        }
        const raw = String(label.hex_color || '').trim();
        if (!raw) {
            return '';
        }
        return raw.startsWith('#') ? raw : `#${raw}`;
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

        this._setOptimisticTask(taskId, {bucket_id: targetBucketId});
        this.requestUpdate();

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
            .finally(() => {
                this._queueRefresh();
                this.requestUpdate();
            });
        return moveRequest;
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
        if (!input) {
            return;
        }
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
            })
            .finally(() => {
                this._queueRefresh();
                this.requestUpdate();
            });
    }

    keyUp(e) {
        if (e.which === 13) {
            this.itemAdd();
        }
    }

    _setTaskDone(task, done) {
        const state = this.hass.states[this.config.entity] || undefined;
        const taskId = this._normalizeId(task.id);
        if (!state || !taskId) {
            return;
        }
        const doneBucketId = done ? this._getDoneBucketId(state) : null;
        const optimisticUpdate = {done: !!done};
        if (doneBucketId) {
            optimisticUpdate.bucket_id = doneBucketId;
        }
        this._setOptimisticTask(taskId, optimisticUpdate);
        this.requestUpdate();

        const doneRequest = this._callVikunja('POST', `/tasks/${taskId}`, {done: !!done});
        doneRequest
            .then(() => {
                if (doneBucketId) {
                    return this._moveTask(taskId, doneBucketId, state);
                }
                return null;
            })
            .finally(() => {
                this._queueRefresh();
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
        const labelFilter = this._parseLabelFilter(this.config.label_filter);

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

        tasks = this._filterTasksByLabel(tasks, labelFilter);

        buckets = this._filterBucketsByDone(buckets);

        if (!buckets.length) {
            buckets = [{
                id: 'default',
                title: state.attributes.friendly_name || 'Tasks',
                tasks: tasks,
            }];
        }

        buckets = buckets.map(bucket => {
            const bucketTasks = tasks.filter(task => (task.bucket_id ?? task.section_id) == bucket.id);
            const filteredTasks = this._filterTasksByLabel(bucketTasks, labelFilter);
            return {
                ...bucket,
                items: this._sortTasksByDue(filteredTasks),
            };
        });

        const showHeader = this.config.show_header ?? true;
        const enableDrag = this._dragEnabled();
        const showLabels = (this.config.show_labels === undefined) || (this.config.show_labels !== false);
        const itemAction = this._getItemAction();
        const styleString = this._styleString({
            '--vkc-header-font-size': this._resolveCssSize(this.config.header_font_size),
            '--vkc-column-font-size': this._resolveCssSize(this.config.column_font_size),
            '--vkc-card-font-size': this._resolveCssSize(this.config.card_font_size),
            '--vkc-column-width': this._resolveCssSize(this.config.column_width),
        });

        const compactClass = (this.config.compact_mode !== undefined) && (this.config.compact_mode !== false)
            ? 'compact'
            : '';

        const useDarkTheme = this.hass?.themes?.darkMode;
        const darkClass = useDarkTheme === undefined ? this._useDarkTheme : useDarkTheme;

        return html`<ha-card class="${showHeader ? 'has-header' : ''} ${darkClass ? 'dark': ''} ${compactClass}" style="${styleString}">
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
                                    const due = this._formatDueDate(this._taskDueDate(task));
                                    return html`
                                        <div
                                            class="card"
                                            .draggable=${enableDrag}
                                            @dragstart=${(event) => this._onDragStart(task, event)}
                                            @dragend=${this._onDragEnd}
                                            @pointerdown=${(event) => this._onPointerDown(task, event)}
                                        >
                                            ${itemAction === 'done'
                                                ? html`<ha-checkbox
                                                            class="vikunja-item-done"
                                                            .checked=${task.done === true}
                                                            @change=${(event) => this._setTaskDone(task, event.target.checked)}
                                                            @pointerdown=${(event) => event.stopPropagation()}
                                                        ></ha-checkbox>`
                                                : html``}
                                            <div class="card-content">
                                                <span class="vikunja-item-content">${title}</span>
                                                ${description
                                                    ? html`<span class="vikunja-item-description">${description}</span>`
                                                    : html``}
                                            ${due
                                                ? html`<span class="vikunja-item-due">${due}</span>`
                                                : html``}
                                            ${showLabels
                                                ? html`<div class="vikunja-labels">
                                                    ${this._getTaskLabels(task).map(label => {
                                                        const color = this._labelColor(label);
                                                        const labelStyle = color ? `--vkc-label-color: ${color};` : '';
                                                        return html`<span class="vikunja-label-chip" style="${labelStyle}">${label.title}</span>`;
                                                    })}
                                                </div>`
                                                : html``}
                                            </div>
                                            ${itemAction === 'delete' && index === buckets.length - 1
                                                ? html`<div class="card-actions">
                                                            <ha-icon-button
                                                                class="vikunja-item-delete"
                                                                @click=${() => this.itemDelete(task)}>
                                                                <ha-icon icon="mdi:close"></ha-icon>
                                                            </ha-icon-button>
                                                        </div>`
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
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1 1 auto;
            min-width: 0;
        }

        .vikunja-item-done {
            margin-right: 4px;
            flex: 0 0 auto;
            --mdc-checkbox-size: 16px;
            --mdc-checkbox-state-layer-size: 20px;
            --mdc-checkbox-touch-target-size: 20px;
        }

        .card-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 0 0 auto;
            margin-left: auto;
        }

        .vikunja-item-description {
            font-size: x-small;
        }

        .vikunja-item-due {
            font-size: x-small;
            opacity: 0.7;
        }

        .vikunja-labels {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .vikunja-label-chip {
            display: inline-flex;
            align-items: center;
            padding: 1px 6px;
            border-radius: 999px;
            font-size: x-small;
            background-color: var(--vkc-label-color, var(--secondary-background-color));
            color: var(--primary-text-color);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .compact .container {
            margin: 12px auto;
        }

        .compact .kanban-heading {
            margin-bottom: 8px;
        }

        .compact .kanban-block {
            margin-right: 8px;
        }

        .compact .kanban-block strong {
            padding: 6px;
            margin-bottom: 6px;
        }

        .compact .vikunja-list-add-row {
            margin-bottom: 6px;
        }

        .compact .card {
            padding: 6px;
            margin: 0px 8px 8px 8px;
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
