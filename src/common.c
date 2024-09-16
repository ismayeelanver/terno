#include "../include/common.h"

int Exit(Exitcode* code) {
  if (code->code < 256 && code->code != 0)
    exit(EXIT_FAILURE);
  else
    exit(EXIT_SUCCESS);
  return 0;
}