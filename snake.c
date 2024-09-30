// snake.c
#include <stdint.h>

typedef struct {
    int32_t x;
    int32_t y;
} Point;

int32_t check_collision(Point head, Point* body, int32_t body_length) {
    for (int32_t i = 0; i < body_length; i++) {
        if (head.x == body[i].x && head.y == body[i].y) {
            return 1;
        }
    }
    return 0;
}

Point update_position(Point head, Point direction) {
    head.x += direction.x;
    head.y += direction.y;
    return head;
}