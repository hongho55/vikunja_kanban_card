# Vikunja Kanban Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![license_badge](https://img.shields.io/badge/license-MIT-green.svg)

Vikunja kanban card for [Home Assistant](https://www.home-assistant.io) Lovelace UI. This card displays tasks from a Vikunja project in a kanban format.

## Installing

### HACS (Custom repository)

This card is installed through HACS as a custom repository.

1. In HACS, open the menu (three dots) -> `Custom repositories`.
2. Add this repository URL and set the category to `Lovelace`.
3. Search for `Vikunja Kanban Card` in the HACS `Frontend` tab and install it.
4. Make sure a GitHub release tag exists so HACS can download the asset.

### Manual

1. Download `vikunja-kanban-card.js` from the latest release.
2. Put `vikunja-kanban-card.js` into your `config/www` folder.
3. Add a reference to `vikunja-kanban-card.js` in Lovelace:
   1. **Using UI:** _Configuration_ -> _Lovelace Dashboards_ -> _Resources_ -> Click Plus -> Set _Url_ as `/local/vikunja-kanban-card.js` -> Set _Resource type_ as `JavaScript Module`.
   2. **Using YAML:**
      ```yaml
      resources:
        - url: /local/vikunja-kanban-card.js
          type: module
      ```
4. Add `custom:vikunja-kanban-card` to Lovelace UI as any other card.

## Using the card

This card uses a sensor entity as its data source. Your sensor should expose:

- `buckets`: list of buckets with `id` and `title` (or `name`).
- `tasks`: list of tasks with `id`, `title` (or `content`), optional `description`, and `bucket_id`.
- `view_id`: optional, but required for moving tasks on newer Vikunja versions.

If your endpoint already returns buckets with nested `tasks`, you can expose that directly and skip `tasks`.

By default the card calls the Vikunja integration service (`vikunja.call_api`). If you prefer `rest_command`, configure it like this:

```yaml
rest_command:
  vikunja:
    url: 'https://vikunja.example.com/api/v1{{ path }}'
    method: '{{ method }}'
    headers:
      Authorization: !secret vikunja_api_token
      Content-Type: 'application/json'
    payload: '{{ payload }}'
```

If you want to override the service name/domain explicitly, set:

```yaml
service_domain: vikunja
service_name: call_api
```

Typical card config:

```yaml
type: 'custom:vikunja-kanban-card'
entity: sensor.vikunja_board
project_id: 1
show_header: true
show_item_add: true
show_item_delete: true
```

### Options

| Name                 |   Type    |   Default    | Description                                                                                           |
| -------------------- | :-------: | :----------: | ----------------------------------------------------------------------------------------------------- |
| `type`               | `string`  | **required** | `custom:vikunja-kanban-card`
| `entity`             | `string`  | **required** | A sensor entity that provides Vikunja buckets/tasks.
| `project_id`         | `number`  | optional     | Vikunja project ID used when creating new tasks.
| `view_id`            | `number`  | optional     | Vikunja view ID for moving tasks between buckets.
| `default_bucket_id`  | `number`  | optional     | Bucket ID for newly created tasks.
| `header_font_size`   | `string`  | optional     | Header font size (e.g. `20px`, `1.2rem`).
| `column_font_size`   | `string`  | optional     | Column font size (e.g. `14px`, `0.9rem`).
| `card_font_size`     | `string`  | optional     | Task card font size (e.g. `13px`).
| `column_width`       | `string`  | optional     | Column width (e.g. `220px`, `16rem`).
| `service_domain`     | `string`  | `vikunja`    | Service domain for API calls.
| `service_name`       | `string`  | `call_api`   | Service name for API calls.
| `show_header`        | `boolean` | `true`       | Show friendly name of the selected sensor in the card header.
| `show_item_add`      | `boolean` | `true`       | Show text input for adding new tasks. Only shown in the first column.
| `show_item_delete`   | `boolean` | `true`       | Show delete buttons. Only shown in the last column.
| `only_today_overdue` | `boolean` | `false`      | Only show tasks that are overdue or due today.
| `due_sort`           | `string`  | optional     | Due date sorting: `none`, `due_first`, `date_asc`.
| `due_first`          | `boolean` | `false`      | Legacy option. Use `due_sort: due_first` instead.
| `show_labels`        | `boolean` | `true`       | Show label chips on each task card.
| `label_filter`       | `string`  | optional     | Comma-separated label names or IDs to show (e.g. `결혼, 개발, 5`).
| `compact_mode`       | `boolean` | `false`      | Reduce padding/margins for a denser layout.
| `hide_done_bucket`   | `boolean` | `false`      | Hide the done/completed column.
| `done_bucket_title`  | `string`  | optional     | Override done column titles (comma-separated, e.g. `완료, Done`).
| `enable_drag`        | `boolean` | `true`       | Enable drag and drop to move tasks between columns.

## Actions

- Drag and drop: move the task between columns.
- Checkbox: mark the task as done or reopen it.
- Cross: delete the selected task from Vikunja.
- Input: add a new task using the input row.

## License

MIT
