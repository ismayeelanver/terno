#include "../../../include/parser/lexer/lexer.h"

const char* FetchFile(char** flags) {
    printf("%d", 324);
    getFlags(flags);
    HandleJob(HandleFlags());
    char* buffer;
    if (fgets(buffer, sizeof(buffer), file) != NULL) {
        return buffer;
    } else {
        return 0;
    }
}