precision mediump float;

uniform float u_time;
uniform vec4 u_translation;
uniform float u_cosB, u_sinB;

uniform mat4 u_modelMatrix;

const float PI = 3.14159265359;

float freq_hz = 0.5, r = 1.0, b = 1.0, g = 1.0, a = 1.0;

attribute vec4 a_position;
attribute float a_pointSize;
attribute vec4 a_color;
varying	vec4 v_color;

void main() {		
        gl_Position = u_modelMatrix * a_position;		
        gl_PointSize = a_pointSize;
		v_color = a_color;
}

