attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform vec4 inputSize;
uniform vec4 outputFrame;

uniform vec2 angle;

varying vec2 vTextureCoord;
varying mat3 rot;


vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return vec2(2.0) * aVertexPosition - vec2(1.0);
}

mat3 rotationXY( vec2 angle ) {
    float cx = cos( angle.x );
    float sx = sin( angle.x );
    float cy = cos( angle.y );
    float sy = sin( angle.y );

    return mat3(
        cy      ,  0.0, -sy,
        sy * sx,  cx,  cy * sx,
        sy * cx, -sx,  cy * cx
    );
}

void main(void) {

    rot = rotationXY(angle);
	vTextureCoord = filterTextureCoord();
    gl_Position = filterVertexPosition();
}
