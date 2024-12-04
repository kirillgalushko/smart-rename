# Smart Rename

Это nodejs библиотека для массового переименования файлов в директориях, поддерживающая кастомные правила трансформации, форматирование имени файла, и обеспечение уникальности файлов в случае конфликтов.

## Использование

```ts
import { smartRename } from 'smart-rename';

smartRename(targetPath, options);
```

## Типы

```ts
export interface SmartRenameOptions {
  outputPath?: string;
  formatCounter?: (name: string, counter: number) => string;
  transform?: (filename: string) => string;
  patternsToRemove?: (string | RegExp)[];
  removeSpaces?: boolean;
}
export declare const smartRename: (
  inputPath: string,
  options: SmartRenameOptions
) => Promise<void>;
```

## Опции

- `outputPath` — Путь к директории для сохранения результатов переименования. Если не указан, файлы будут перезаписаны.
- `transform` — Функция для изменения имени файла.
- `patternsToRemove` — Массив регулярных выражений для удаления шаблонов из имени файлов.
- `removeSpaces` — Удаляет пробелы из имен файлов (по умолчанию false).
- `formatCounter` — Функция для форматирования счетчика при дублировании файлов. По умолчанию используется [defaultFormatCounter](https://github.com/kirillgalushko/rename/blob/20d7a6d496bcc0a93e5d390af6e3e1a4e6c74ed5/src/generateUniqueName.ts#L5).

## Пример

### Чистка имени файла

```ts
const patternsToRemove = [
  /-svgrepo-com/g,
  /-logo/g,
  /-color/g,
  /-icon/g,
  /_\- logo/g,
  /\d{1,}x\d{1,}/g,
  /\(.*?\)/g,
  /_.*/g,
  /id[^\s]*/g,
  /^-|-$/g,
  /audioblocks-/g,
];

smartRename(testResultDir, {
  patternsToRemove,
  removeSpaces: true,
});

// audioblocks-fatal-error-2_SY8xTgf8ADU_NWM.mp3 -> fatal-error-2.mp3
// audioblocks-notification-message-light-interface-sound-2_SFIlEpWL0vU_NWM.mp3 -> notification-message-light-interface-sound-2.mp3
// audioblocks-pleasant-interface-alert-2-message-hint-ding-message-hint-ding_Ht4sRWUAvU_NWM.mp3 -> pleasant-interface-alert-2-message-hint-ding-message-hint-ding.mp3
// digital-ocean-svgrepo-com (1).svg -> digital-ocean.svg
// download-id4knLKYsV-1732567273343 -> download
// gameloft.svg -> gameloft.svg
// intel (1).txt -> intel.txt
// intel_- logo-1000x660.svg -> intel.svg
// light-switch_NWM.mp3 -> light-switch.mp3
// login_Msd12dsRG3.txt -> login.txt
// mattermost-icon-svgrepo-com.svg -> mattermost.svg
// mattermost-svgrepo-com.svg -> mattermost (2).svg
// mouse-click-computer_Gkjr_nNu_NWM.txt -> mouse-click-computer.txt
// test -> test
```

### Кастомизация имени файла

```ts
smartRename(inputPath, {
  transform: (filename: string) => {
    const prefix = 'prefix-';
    const postfix = '-postfix';
    return prefix + filename + postfix;
  };,
});

// example.svg -> prefix-example-postfix.svg
```

### Кастомизация счетчика дубликатов

```ts
smartRename(inputPath, {
  patternsToRemove: [/-test/g],
  formatCounter: (name, counter) => {
    return `${name}__${counter}`;
  },
});

// example.svg -> example.svg
// example-test.svg -> example__2.svg
```

## Разработка

Сборка осуществляется с помощью [esbuild](https://esbuild.github.io/) командой

```bash
npm run build
```

Для запуска тестов с визуальным отображением в браузере используется команда:

```bash
npm run test/ui
```

## TODO

- [ ] Добавить запуск тестов через GitHub Actions
- [ ] Добавить исполняемый файл для запуска из консоли
- [ ] Добавить скрипт для релиза новой версии
