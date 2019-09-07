uniform vec4 inputPixel;

uniform samplerCube diffMap;
//uniform samplerCube normalMap;
//uniform samplerCube specMap;
uniform vec2 uDissolveSettings;
uniform vec4 uEdgeColor;

varying vec2 vTextureCoord;
varying mat3 rot;

const float PI = 3.14159265359;
const float DEG_TO_RAD = PI / 180.0;

float helpFunc(vec2 p) {
    return p.x*p.x - p.y;
}

float fwidthCustom(vec2 p) {
    float cur = helpFunc(p);
    float dfdx = helpFunc(p + inputPixel.z) - cur;
    float dfdy = helpFunc(p + inputPixel.w) - cur;

    return abs(dfdx) + abs(dfdy);
}

vec3 random3(vec3 c) {

    float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0*j);
    j *= .125;
    r.x = fract(512.0*j);
    j *= .125;
    r.y = fract(512.0*j);
    return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;

float simplex3d(vec3 p) {

    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));
    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e*(1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy*(1.0 - e);
    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0*G3;
    vec3 x3 = x - 1.0 + 3.0*G3;

    vec4 w, d;

    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);

    w = max(0.6 - w, 0.0);

    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);

    w *= w;
    w *= w;
    d *= w;

    return dot(d, vec4(52.0));
}

const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);

float simplex3d_fractal(vec3 m) {
    return   0.5333333*simplex3d(m*rot1)
            +0.2666667*simplex3d(2.0*m*rot2)
            +0.1333333*simplex3d(4.0*m*rot3)
            +0.0666667*simplex3d(8.0*m);
}

vec3 getNorm(vec3 tex) {
    return normalize(vec3(tex * vec3(2.0) - vec3(1.0)));
}

mat3 calcTBN (vec3 pos) {
    vec3 p = normalize(vec3(pos.x, 0.0, pos.z));
    vec3 n = normalize(pos);
    vec3 t = vec3(-p.y, 0.0, p.x);
    vec3 b = cross(n, t);
    return mat3(t, b, n);
}

vec3 phongContribForLight(vec3 k_d, float k_s, vec3 k_n, float alpha, vec3 p, vec3 eye,
    vec3 lightPos, vec3 lightIntensity) {
    vec3 L = normalize(lightPos - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, k_n));

    float dotLN = dot(L, k_n);
    float dotRV = dot(R, V);

    if (dotLN < 0.0) {
        return vec3(0.0, 0.0, 0.0);
    }

    if (dotRV < 0.0) {
        return lightIntensity * (k_d * dotLN);
    }

    return lightIntensity * (k_d * dotLN );
}

vec3 phongIllumination(vec3 k_a, vec3 k_d, float k_s, vec3 k_n, float alpha, vec3 p, vec3 eye) {

    const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
    vec3 color = ambientLight * k_a;
    vec3 lightPos = vec3(0.0, 0.0, 5.0);
    vec3 lightIntensity = vec3(0.4, 0.4, 0.4);
    color = phongContribForLight(k_d, k_s, k_n, alpha, p, eye, lightPos, lightIntensity);
    return color;
}

void main(void) {

    float z = sqrt(1.0 - dot( vTextureCoord,  vTextureCoord));
    float dist = length( vTextureCoord);
    if (dist > 1.0) discard;

    vec3 pos1 = vec3(vTextureCoord, -z);
    vec3 pos2 = vec3( vTextureCoord, z);

    vec3 tpos1 = rot * pos1;
    vec3 tpos2 = rot * pos2;

    mat3 tbn1 = calcTBN(pos1);
    mat3 tbn2 = calcTBN(pos2);

    float n1 = simplex3d_fractal(tpos1+1.0);
    float n2 = simplex3d_fractal(tpos2+1.0);

    n1 = 0.5 + 0.5 * n1;
    n2 = 0.5 + 0.5 * n2;
    float edgeSize = uDissolveSettings.x + uDissolveSettings.y;
    float dissolveUsage = ceil(uDissolveSettings.x);
    float edge1 = step(n1, edgeSize) * dissolveUsage;
    float edge2 = step(n2, edgeSize) * dissolveUsage;

    vec4 bg = vec4(0.0);

    vec4 col1 = textureCube(diffMap, tpos1);
    vec4 col2 = textureCube(diffMap, tpos2);
    //col2.rgb *= vec3(0.5);
    //vec3 k1_n = tbn1 * getNorm(textureCube(normalMap, tpos1).rgb);
    vec3 k1_a = vec3(0.4, 0.4, 0.4);
    //float k1_s = textureCube(specMap, tpos1).r;
    //vec3 k2_n = tbn2 * textureCube(normalMap, tpos2).rgb;
    vec3 k2_a = vec3(0.4, 0.4, 0.4);
    //float k2_s = textureCube(specMap, tpos2).r;
    float shininess = 10.0;
    //col1  = vec4(phongIllumination(k1_a, col1.rgb, k1_s, k1_n, shininess, pos1, ro), col1.a);
    //col2  = vec4(phongIllumination(k2_a, col2.rgb, k2_s, k2_n, shininess, pos2, ro), col2.a);
    vec4 dissolvedTexture1 = col1 - edge1;
    vec4 coloredEdge1 = edge1 * uEdgeColor;
    dissolvedTexture1 = dissolvedTexture1 + coloredEdge1;
    vec4 dissolvedTexture2 = col2 - edge2;
    vec4 coloredEdge2 = edge2 * uEdgeColor;
    dissolvedTexture2.rgb *= 0.5;
    dissolvedTexture2 = dissolvedTexture2 + coloredEdge2;
    if(n1 <= uDissolveSettings.x) {
        dissolvedTexture1 = vec4(0.0, 0.0, 0.0, 0.0);
    }
    if(n2 <= uDissolveSettings.x) {
            dissolvedTexture2 = vec4(0.0, 0.0, 0.0, 0.0);
    }
    float alph = (dissolvedTexture1.a + dissolvedTexture2.a * (1.0 - dissolvedTexture1.a));
    gl_FragColor = vec4(dissolvedTexture1.rgb + dissolvedTexture2.rgb * vec3((1.0 - dissolvedTexture1.a)), alph);
    //vec3 gamma = vec3(1.0/2.2);
    //col = vec4(pow(col.rgb, gamma), col.a);
}
