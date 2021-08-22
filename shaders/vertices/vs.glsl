#version 300 es
precision mediump float;

in vec3 in_position;
in vec3 in_normal;
in vec2 in_uv;

out vec3 fs_position;
out vec3 fs_normal;
out vec2 fs_uv;

uniform mat4 nMatrix;//normalsMatrix
uniform mat4 pMatrix;//utils.transposeMatrix(viewWorldMatrix)
uniform mat4 matrix;//  projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
//matrix should be = utils.transposeMatrix(projectionMatrix)
//where projectionMatrix = utils.multiplyMatrices(perspectiveMatrix,viewWorldMatrix);
//perspectiveMatrix is a simple utils.MakePerspective(...)
//viewWorldMatrix= utils.multiplyMatrices(viewMatrix,WorldMatrix);
void main() {
  fs_uv = in_uv;
  fs_normal = mat3(nMatrix) * in_normal;//ok
  fs_position = (pMatrix * vec4(in_position, 1.0)).xyz;

  gl_Position = matrix * vec4(in_position, 1.0);
}
