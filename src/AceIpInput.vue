<template>
  <div class="ace-ip-input">
    <div class="ace-ip-input__wrapper">
      <div class="ace-ip-input__fields">
        <template v-for="(_, key) in octets" :key="key">
          <div
            v-if="
              key !== String(IpInputType.Mask) &&
              key !== String(IpInputType.Port)
            "
            class="ace-ip-input__octet"
          >
            <input
              v-model="octets[key]"
              autocomplete="off"
              ref="octetsRef"
              type="text"
              maxlength="3"
              placeholder="255"
              @paste.prevent="onPaste"
              @copy="onCopy"
              @keydown="onHandleKeydown($event, key)"
              @blur="onBlur"
              @focus="onFocus"
            />
          </div>
          <div
            v-else-if="key === String(IpInputType.Mask)"
            class="ace-ip-input__mask"
          >
            <input
              v-model="octets[key]"
              autocomplete="off"
              type="text"
              ref="restRef"
              maxlength="2"
              placeholder="32"
              @paste.prevent="onPaste"
              @copy="onCopy"
              @keydown="onHandleKeydownRest($event)"
              @blur="onBlur"
              @focus="onFocus"
            />
          </div>
          <div
            v-else-if="key === String(IpInputType.Port)"
            class="ace-ip-input__port"
          >
            <input
              v-model="octets[key]"
              autocomplete="off"
              type="text"
              ref="restRef"
              maxlength="5"
              placeholder="65535"
              @paste.prevent="onPaste"
              @copy="onCopy"
              @keydown="onHandleKeydownRest($event)"
              @blur="onBlur"
              @focus="onFocus"
            />
          </div>
        </template>
      </div>
      <div
        v-if="isFilled && showCloseIcon"
        class="ace-ip-input__close"
        @click="onClear"
      >
        <slot name="resetButton"> x </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  defineProps,
  withDefaults,
  defineEmits,
  watch,
  computed,
  nextTick,
} from "vue";
import { IpInput, TIpInputObject } from "./IpInput";
import { removeNaNCharacters } from "./helpers";
import { IpInputType } from "./types";

const emit = defineEmits([
  "update:modelValue",
  "clear",
  "copy",
  "blur",
  "focus",
]);

const octetsRef = ref();
const restRef = ref();

interface IProps {
  modelValue: string;
  showCloseIcon?: boolean;
  type?: IpInputType;
}

const props = withDefaults(defineProps<IProps>(), {
  type: IpInputType.IpAddress,
  showCloseIcon: true,
});
// state
const octets = ref<TIpInputObject>(
  new IpInput(props.modelValue, props.type).getObject()
);

const isFocused = ref(false);

const isFilled = computed(() => {
  return Object.values(octets.value).some((value) => !!value);
});

const isRest = computed(() => {
  return props.type !== IpInputType.IpAddress;
});

watch(
  () => props.modelValue,
  () => {
    octets.value = new IpInput(props.modelValue, props.type).getObject();
  }
);

watch(
  () => octets.value,
  () => {
    emit(
      "update:modelValue",
      new IpInput(octets.value, props.type).getString()
    );
  },
  { deep: true }
);

const onClear = () => {
  octets.value = new IpInput("", props.type).getObject();
  octetsRef.value[0]?.focus();
  emit("clear");
};

const onPaste = (event: ClipboardEvent) => {
  const clipboardText = event.clipboardData?.getData("text/plain");
  if (!clipboardText) {
    return;
  }

  octets.value = new IpInput(clipboardText, props.type).getObject();
};

const onCopy = () => {
  emit("copy", new IpInput(octets.value, props.type).getString());
};

const onBlur = () => {
  const el = document.querySelector(".ace-ip-input__fields");
  nextTick(() => {
    if (!el?.contains(document.activeElement)) {
      isFocused.value = false;
      emit("blur");
    }
  });
};

const onFocus = () => {
  if (isFocused.value !== true) {
    isFocused.value = true;
    emit("focus");
  }
};

const onHandleKeydown = ($event: KeyboardEvent, key: keyof TIpInputObject) => {
  const numberKey = Number(removeNaNCharacters(key)) - 1;
  const keyCode = $event.keyCode;

  const backspaceKey = 8;
  const deleteKey = 46;
  const leftArrowKey = 37;
  const rightArrowKey = 39;

  const isCursorAtStart = octetsRef.value[numberKey]?.selectionStart === 0;
  const isCursorAtEnd =
    octetsRef.value[numberKey]?.selectionStart === octets.value[key]?.length;
  const previousOctet = octetsRef.value[numberKey - 1];
  const nextOctet = octetsRef.value[numberKey + 1];
  const isSelected = window.getSelection()?.type === "Range";

  if ($event.key === ".") {
    if (octets.value[key].length && nextOctet) {
      nextOctet.focus();
    }
  }

  if (key === "octet4") {
    if ($event.key === "/" && props.type === IpInputType.Mask) {
      restRef.value[0].focus();
      return;
    }

    if ($event.key === ":" && props.type === IpInputType.Port) {
      restRef.value[0].focus();
      return;
    }
  }

  switch (keyCode) {
    case backspaceKey:
    case leftArrowKey:
      if (!previousOctet || !isCursorAtStart || isSelected) {
        return;
      }
      previousOctet.focus();
      setTimeout(() => {
        previousOctet.selectionStart = 4;
      });

      break;
    case deleteKey:
    case rightArrowKey:
      if (!isCursorAtEnd) {
        return;
      }

      if (!!nextOctet) {
        nextOctet.focus();
        setTimeout(() => {
          try {
            nextOctet.setSelectionRange(0, 0);
          } catch {}
        });
        return;
      }

      if (isRest) {
        try {
          restRef.value[0]?.focus();
        } catch {}
        setTimeout(() => {
          try {
            restRef.value[0]?.setSelectionRange(0, 0);
          } catch {}
        });
      }
      break;
  }
};

const onHandleKeydownRest = ($event: KeyboardEvent) => {
  const keyCode = $event.keyCode;
  const isSelected = window.getSelection()?.type === "Range";

  const isCursorAtStart = restRef.value[0].selectionStart === 0;

  const backspaceKey = 8;
  const leftArrowKey = 37;

  const lastOctet = octetsRef.value[3];

  switch (keyCode) {
    case backspaceKey:
    case leftArrowKey:
      if (!isCursorAtStart || isSelected) {
        return;
      }

      lastOctet.focus();
      setTimeout(() => {
        lastOctet.selectionStart = 4;
      });
  }
};
</script>

<style lang="scss">
.ace-ip-input {
  $self: &;
  min-width: 240px;
  max-width: 240px;
  border: 1px solid rgba(black, 0.5);

  &__wrapper {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-right: 10px;
    min-width: 240px;
  }

  &__fields {
    padding: 5px 10px;
    display: flex;
    gap: 5px;
    align-items: center;
  }

  input {
    margin: 0;
    text-align: center;
    outline: none;
    border: none;
  }

  &__octet input {
    max-width: 26px;
  }

  &__octet:not(:nth-last-child(-n + 1 of .ace-ip-input__octet))::after {
    content: ".";
  }

  &__mask input {
    width: 30px;
  }

  &__mask::before {
    content: "/";
    margin-right: 5px;
  }

  &__port input {
    max-width: 40px;
  }
  &__port::before {
    content: ":";
    margin-right: 5px;
  }

  &__mask input {
    max-width: 25px;
  }
}
</style>
