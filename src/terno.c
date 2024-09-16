#include "../include/shared.h"
#include <stdio.h>
int main(int argc, char *argv[]) {
  const char *content = FetchFile(argv);
  printf("%s", content);
  return 0;
}