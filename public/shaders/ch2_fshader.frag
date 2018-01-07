precision mediump float;

uniform float u_time;

const float PI = 3.14159265359;

float freq_hz = 0.05, r = 1.0, b = 1.0, g = 1.0, a = 1.0;

void main() {	
    gl_FragColor = vec4(
        sin(u_time * freq_hz * PI) * r, 
        sin(u_time * freq_hz * PI + (3.0 * PI)/4.0) * b, 
        sin(u_time * freq_hz * PI + (5.0 * PI)/4.0) * g, 
        a
    );	
	
	// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
