module.exports = {
    configureWebpack: {
        optimization: {
            splitChunks: false
        },
        devServer: {
            headers: { "Access-Control-Allow-Origin": "*" }
          }
    },
    css: {
        extract: false,
    },
    filenameHashing: false,
}