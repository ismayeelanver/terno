#include <stdio.h>
#include "../include/shared.h"
int main(int argc, char *argv[]) {
  const char* content = FetchFile(argv);
  printf("%s", content);
  return 0;
}