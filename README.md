# Ace Ip Input

A convinient way to type IP address in your forms.

## Features

- Type '.' to move to next octet
- Use arrow keys to navigate between octets
- Flawless usage of `Backspace` and `Delete` keys
- Type IP address with port or prefix

## Installation and basic usage

```bash
npm install ace-ip-input
```

For the `type` prop you can just pass a string. (All possible types are listed down below)

```vue
<script setup>
import { ref } from "vue";
import { AceIpInput } from "ace-ip-input";

const ip = ref("");
</script>

<template>
  <div>
    <ace-ip-input v-model="ip" type="ipAddress" />
  </div>
</template>

<style src="ace-ip-input/style.css"></style>
```

### Usage with TypeScript

Import the `IpInputType` enum to pass the type

```vue
<script setup lang="ts">
import { ref } from "vue";
import { AceIpInput, IpInputType } from "ace-ip-input";

const ip = ref("");
</script>

<template>
  <div>
    <ace-ip-input v-model="ip" type="IpInputType.Mask" />
  </div>
</template>

<style src="ace-ip-input/style.css"></style>
```

## Props

| Name    | Type                      | Default                                | Description                           |
| ------- | ------------------------- | -------------------------------------- | ------------------------------------- |
| type    | `string \|\| IpInputType` | `ipAddress \|\| IpInputType.IpAddress` | Determines the type of the IP address |
| v-model | `string`                  |                                        | Your model                            |

## Slots

| Name  | Description                |
| ----- | -------------------------- |
| clear | Slot for your clear button |

## Events

| Name  | Attributes | Listen to | Description                            |
| ----- | ---------- | --------- | -------------------------------------- |
| clear |            | `@clear`  | Emitted when `clear` button is pressed |
| copy  | `string`   | `@copy`   | Emitted when Ctrl-C or Copy is pressed |
| blur  |            | `@blur`   | Emitted when IpInput is blurred        |
| focus |            | `@focus`  | Emitted when IpInput is focused        |
