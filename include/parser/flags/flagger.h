#ifndef FLAGGER_H
#define FLAGGER_H
#include "../../common.h"
#include <stdio.h>
#include <stdlib.h>
typedef const char *Flag;
typedef int Done;
Flag nextFlag();
Done HandleFlags();
void getFlags(char *flags[]);
static FILE *file;

static const char *Flags;
static int current_flag = 0;
Exitcode *HandleJob(Done job);
#endif