#ifndef COMMON_H
#define COMMON_H
#include <stdint.h>
#include <stdlib.h>

typedef struct {
  int64_t code;
} Exitcode;

int Exit(Exitcode *code);
#endif