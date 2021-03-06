var tl = {
    loadSyncTextures: function (txtpath, node) {
            var textureImage = new Image();
            textureImage.src = txtpath;
            textureImage.onload = function () {
                var texture = gl.createTexture();
                //gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
                // Add texture to the node
                node.drawInfo.textureRef= [texture];
            };
        return node.drawInfo.textureRef;
    }
}
