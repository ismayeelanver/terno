CC = clang
SRC = $(wildcard src/*.c)
CFLAGS = -Wall -Wextra -pedantic -std=c99
O_BUILD = build/obj
BIN = build/bin
OBJ = $(patsubst src/%.c, $(O_BUILD)/%.o, $(SRC))

all: $(OBJ)
	@mkdir -p $(BIN)
	$(CC) -o $(BIN)/terno $(OBJ) $(CFLAGS)

$(O_BUILD)/%.o: src/%.c
	@mkdir -p $(O_BUILD)
	$(CC) -c $< -o $@

clean:
	rm -rf $(O_BUILD) $(BIN)/terno
