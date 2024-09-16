#include "../../../include/parser/flags/flagger.h"
static const char *helpMessage = {""
                                  "Terno 2024 ©"
                                  "Usage: terno [-f {file}, -h]"
                                  ""
                                  ""
                                  "terno run {file} will run the file"
                                  "and terno help will show this message"
                                  ""};

void getFlags(char *flags[]) { Flags = *flags; }

Flag nextFlag() {
  current_flag++;
  return &Flags[current_flag];
}

Done HandleFlags() {
  switch (Flags[current_flag]) {
  case *"-h" | *"help": {
    printf("%s", helpMessage);
    return 0;
  };
  case *"-r" | *"run": {
    file = fopen(nextFlag(), "r");
    if (file == NULL) {
      return 2 | 3;
    }
    return 0;
  }
  default:
    printf("%s", helpMessage);
    return 1;
  }
}

Exitcode *HandleDone(Done job) {
  Exitcode *code = {0};
  code->code = 0;
  switch (job) {
  case 1: {
    printf("Exit with error code 1.");
    code->code = job;
    break;
  }
  case 2 | 3: {
    printf("Cannot find file.");
    code->code = job;
    break;
  }
  default: {
    break;
  }
  }
  return code;
}
