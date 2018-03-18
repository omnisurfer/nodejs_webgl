precision mediump float;

uniform float u_time;
varying vec4 v_color;
uniform float u_width;
uniform float u_height;

uniform sampler2D u_sampler;
varying vec2 v_texCoord;

const float PI = 3.14159265359;

float freq_hz = 0.05, r = 1.0, b = 1.0, g = 1.0, a = 1.0;

void main() {    
    //gl_FragColor = vec4(gl_FragCoord.x/u_width, 0.0, gl_FragCoord.y/u_height, 1.0);
	
	gl_FragColor = texture2D(u_sampler, v_texCoord) * vec4(gl_FragCoord.x/u_width, 0.0, gl_FragCoord.y/u_height, 1.0);
}
