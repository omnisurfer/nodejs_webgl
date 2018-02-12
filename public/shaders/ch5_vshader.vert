precision mediump float;

uniform float u_time;
uniform vec4 u_translation;
uniform float u_cosB, u_sinB;

uniform mat4 u_modelMatrix;

const float PI = 3.14159265359;

float freq_hz = 0.5, r = 1.0, b = 1.0, g = 1.0, a = 1.0;

attribute vec4 a_position;
attribute float a_size;

void main() {
		
		/*
        gl_Position.x = (a_position.x * u_cosB) - (a_position.y * u_sinB) + u_translation.x;		
        gl_Position.y = (a_position.x * u_sinB) + (a_position.y * u_cosB) + u_translation.y;		
        gl_Position.z = a_position.z + u_translation.z;
        gl_Position.w = 1.0;
		*/
		
		gl_Position = u_modelMatrix * a_position;
		
        gl_PointSize = a_size;		
}

