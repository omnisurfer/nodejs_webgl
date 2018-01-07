precision mediump float;

uniform float u_time;

const float PI = 3.14159265359;

float freq_hz = 0.5, r = 1.0, b = 1.0, g = 1.0, a = 1.0;

attribute vec4 a_position;
attribute float a_size;

void main() {
        // gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
        gl_Position = a_position;
        gl_PointSize = a_size;		
}

